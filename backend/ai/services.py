import json
from api.models import Course, Question, Week, Material, Code
from .client import get_ai_client
from .constants import (
    QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, QUESTION_TYPE_CHOICES, 
    DIFFICULTIES,
    DIFFICULTY_MAPPING, ANSWER_COMPARISON_TEMPLATE, CODE_COMPARISON_TEMPLATE,
    CODE_DIFFICULTIES, CODE_GENERATION_TEMPLATE
)
from itertools import product
from transformers import pipeline, AutoTokenizer
import textwrap
import json
import textwrap
import os
from concurrent.futures import ThreadPoolExecutor
import torch
import random

# Check CUDA availability and set device
if torch.cuda.is_available():
    device = 0  # Use first GPU
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")
else:
    device = -1  # Use CPU
    print("CUDA not available, using CPU")

def _summarize_chunk(chunk: str, summarizer) -> str:
    input_length = len(chunk.split())
    target_length = int(input_length * 0.9)
    min_len = max(30, int(target_length * 0.9))
    min_len = min(min_len, 142)

    try:
        result = summarizer(
            chunk,
            min_length=min_len,
            do_sample=False,
            clean_up_tokenization_spaces=True
        )
        summary = result[0]['summary_text'].strip()
        return ' '.join(summary.split())
    except Exception as e:
        print(f"Error summarizing chunk: {str(e)}")
        return chunk

def generate_material_summary(material: str) -> str:
    chunks = textwrap.wrap(material, width=1024)
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=device)
    
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(_summarize_chunk, chunk, summarizer) for chunk in chunks]
        full_summary = [future.result() for future in futures]

    return "\n\n".join(full_summary)



def parse_question_lines(response_text):
    questions = []
    for line in response_text.split('\n'):
        line = line.strip()
        if not line or line.count('|') != 4:
            continue
        
        try:
            question, answer, explanation, q_type, difficulty = line.split('|')
            questions.append({
                "question": question.strip(),
                "answer": answer.strip(),
                "explanation": explanation.strip(),
                "type": q_type.strip(),
                "difficulty": difficulty.strip()
            })
        except Exception as e:
            print(f"Error parsing line: {line}\nError: {str(e)}")
            continue
    
    return questions

def generate_questions_for_chunk(chunk, client):
    word_count = len(chunk.split())
    questions_per_level = max(2, min(12, (word_count * 2) // 1000))
    
    prompt = QUESTION_GEN_TEMPLATE.format(
        num_questions=questions_per_level,
        difficulties=", ".join(DIFFICULTIES),
        chunk=chunk,
        question_types=", ".join(QUESTION_TYPE_CHOICES)
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        questions = parse_question_lines(response.choices[0].message.content)
        return questions
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        fallback_questions = []
        for difficulty in DIFFICULTIES:
            for _ in range(questions_per_level):
                fallback_questions.append({
                    "question": f"Sample {difficulty} question about this section",
                    "answer": f"Sample {difficulty} answer",
                    "explanation": f"Sample {difficulty} explanation",
                    "type": "multiple_choice",
                    "difficulty": difficulty
                })
        return fallback_questions

def generate_questions_for_week(week: Week) -> dict:
    try:
        material = week.materials.first()
        if not material or not material.summarized_material:
            raise ValueError("Material summary not generated yet")
    except Material.DoesNotExist:
        raise ValueError(f"No material found for week {week.week_number}")

    client = get_ai_client()
    raw_questions = []
    
    summarized_material = material.summarized_material
    chunks = textwrap.wrap(summarized_material, width=MAX_CHUNK_SIZE)

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = []
        for chunk in chunks:
            futures.append(
                executor.submit(
                    generate_questions_for_chunk,
                    chunk=chunk,
                    client=client
                )
            )

        for future in futures:
            raw_questions.extend(future.result())

    # Format for output
    questions_data = [
        {
            "week": week.id,
            "difficulty": DIFFICULTY_MAPPING[q['difficulty']],
            "question_type": q['type'],
            "question_text": q['question'],
            "answer": q['answer'],
            "explanation": q['explanation'],
        }
        for q in raw_questions
    ]
    
    return questions_data


def compare_open_answers(answer: str, user_answer: str) -> dict:
    client = get_ai_client()

    # Convert user_answer to string if it's a list
    if isinstance(user_answer, list):
        user_answer = " ".join(user_answer)

    prompt = ANSWER_COMPARISON_TEMPLATE.format(
        answer=answer,
        user_answer=user_answer
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        result = {'is_correct': response.choices[0].message.content}
        return result

    except Exception as e:
        print(f"Error in open answer comparison: {str(e)}")
        result = {
            'is_correct': user_answer.lower().strip() == answer.lower().strip()
        }
        return result


def compare_coding_answers(answer: str, user_answer: str, programming_language: str = "python") -> dict:
    """Compare coding question answers."""
    client = get_ai_client()
    prompt = CODE_COMPARISON_TEMPLATE.format(
        correct_answer=answer,
        user_answer=user_answer,
        programming_language=programming_language
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        result = response.choices[0].message.content
        return {
            'user_score': result
        }
        
    except Exception as e:
        print(f"Error in coding answer comparison: {str(e)}")
        # Fallback to basic string comparison if AI fails
        return {
            'user_score': 0
        }

def parse_code_lines(response_text):
    codes = []
    challenge_blocks = response_text.strip().split('==============')
    
    for block in challenge_blocks:
        block = block.strip()
        if not block:
            continue

        try:
            problem_statement_marker = "Problem Statement:"
            solution_marker = "Solution:"
            template_marker = "Template:"
            difficulty_marker = "Difficulty:"

            p_start = block.find(problem_statement_marker)
            s_start = block.find(solution_marker)
            t_start = block.find(template_marker)
            d_start = block.find(difficulty_marker)

            if not all(x != -1 for x in [p_start, s_start, t_start, d_start]):
                print(f"Skipping malformed block: {block}")
                continue

            problem_statement = block[p_start + len(problem_statement_marker):s_start].strip()
            solution = block[s_start + len(solution_marker):t_start].strip()
            template_code = block[t_start + len(template_marker):d_start].strip()
            difficulty = block[d_start + len(difficulty_marker):].strip()

            if not all([problem_statement, solution, template_code, difficulty]):
                print(f"Skipping block with empty fields: {block}")
                continue

            codes.append({
                "problem_statement": problem_statement,
                "solution": solution,
                "template_code": template_code,
                "difficulty": difficulty,
            })

        except Exception as e:
            print(f"Error parsing block: {block}\\nError: {str(e)}")
            continue
            
    return codes

def generate_codes_for_chunk(chunk, client, language):
    word_count = len(chunk.split())
    codes_per_level = max(1, min(2, (word_count // 1000)))

    prompt = CODE_GENERATION_TEMPLATE.format(
        num_codes=codes_per_level,
        difficulties=", ".join(CODE_DIFFICULTIES),
        chunk=chunk,
        programming_language=language,
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        codes = parse_code_lines(response.choices[0].message.content)
        return codes
    except Exception as e:
        print(f"Error generating codes for chunk: {str(e)}")
        return []


def generate_coding_problems_for_week(week: Week) -> dict:
    try:
        material = week.materials.first()
        if not material or not material.summarized_material:
            raise ValueError("Material summary not generated yet")
    except Material.DoesNotExist:
        raise ValueError(f"No material found for week {week.week_number}")

    client = get_ai_client()
    
    summarized_material = material.summarized_material
    chunks = textwrap.wrap(summarized_material, width=MAX_CHUNK_SIZE)
    language = week.course.language

    all_raw_codes = []
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [
            executor.submit(generate_codes_for_chunk, chunk, client, language)
            for chunk in chunks
        ]
        for future in futures:
            all_raw_codes.extend(future.result())

    # Filter and limit codes per difficulty
    MAX_PER_DIFFICULTY = 5
    final_codes_by_difficulty = {diff: [] for diff in CODE_DIFFICULTIES}
    
    for code in all_raw_codes:
        difficulty = code.get("difficulty")
        if difficulty in final_codes_by_difficulty and len(final_codes_by_difficulty[difficulty]) < MAX_PER_DIFFICULTY:
            final_codes_by_difficulty[difficulty].append(code)

    raw_codes = [code for codes in final_codes_by_difficulty.values() for code in codes]

    # Cleanup existing questions
    Code.objects.filter(week=week).delete()

    # Create new questions
    codes_to_create = [
        Code(
            week=week,
            difficulty=q.get('difficulty', 'E')[0],  # Default to Easy if missing
            problem_statement=q.get('problem_statement', ''),
            solution=q.get('solution', ''),
            template_code=q.get('template_code', ''),
        ) for q in raw_codes
    ]

    created_codes = Code.objects.bulk_create(codes_to_create)

    # Final distribution report
    difficulty_counts = {d: len(final_codes_by_difficulty[d]) for d in CODE_DIFFICULTIES}

    return {
        "week_id": week.id,
        "course": week.course.title,
        "total_codes": len(created_codes),
        "chunks_processed": len(chunks),
        "difficulty_distribution": difficulty_counts,
    }
