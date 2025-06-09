import json
from api.models import Course, Question, Week, Material, Code
from .client import get_ai_client
from .constants import (
    QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, QUESTION_TYPE_CHOICES, 
    DIFFICULTIES, QUESTIONS_PER_LEVEL, SUMMARY_TEMPLATE, 
    DIFFICULTY_MAPPING, ANSWER_COMPARISON_TEMPLATE, DISTRIBUTIONS, CHECK_LANGUAGE_TEMPLATE, CODE_COMPARISON_TEMPLATE,
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

def generate_questions_for_chunk(chunk, difficulty, client):
    word_count = len(chunk.split())
    questions_per_level = max(2, min(12, (word_count // 1000) * 2))
    
    prompt = QUESTION_GEN_TEMPLATE.format(
        num_questions=questions_per_level,
        difficulty=difficulty,
        chunk=chunk,
        question_types=", ".join(QUESTION_TYPE_CHOICES)
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return parse_question_lines(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating {difficulty} questions: {str(e)}")
        # Return fallback questions
        return [{
            "question": f"Sample {difficulty} question about this section",
            "answer": f"Sample {difficulty} answer",
            "explanation": f"Sample {difficulty} explanation",
            "type": "multiple_choice",
            "difficulty": difficulty
        } for _ in range(questions_per_level)]

def generate_questions_for_week(week: Week) -> dict:
    try:
        material = week.materials.first()
        if not material or not material.summarized_material:
            raise ValueError("Material summary not generated yet")
    except Material.DoesNotExist:
        raise ValueError(f"No material found for week {week.week_number}")

    client = get_ai_client()  # Your client initialization function
    raw_questions = []
    
    summarized_material = material.summarized_material
    chunks = textwrap.wrap(summarized_material, width=MAX_CHUNK_SIZE)

    # Process chunks in parallel
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = []
        for chunk, difficulty in product(chunks, DIFFICULTIES):
            futures.append(
                executor.submit(
                    generate_questions_for_chunk,
                    chunk=chunk,
                    difficulty=difficulty,
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
    """Compare open question answers."""
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
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result

    # {
    #     "is_correct": true/false,
    #     "explanation": "Brief explanation of why the answer is correct or incorrect"
    # }
    except Exception as e:
        print(f"Error in open answer comparison: {str(e)}")
        result = {
            'is_correct': user_answer.lower().strip() == answer.lower().strip(),
            'explanation': ""
        }
        return result


def compare_coding_answers(answer: str, user_answer: str) -> dict:
    """Compare coding question answers."""
    client = get_ai_client()
    prompt = CODE_COMPARISON_TEMPLATE.format(
        answer=answer,
        user_answer=user_answer
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {
            'user_score': result['user_score'],
            'error': result['error']
        }
        
    except Exception as e:
        print(f"Error in coding answer comparison: {str(e)}")
        # Fallback to basic string comparison if AI fails
        return {
            'user_score': 0,
            'error': "logic error in this line ..."
        }


def check_language(course_title: str) -> str:
    client = get_ai_client()
    prompt = CHECK_LANGUAGE_TEMPLATE.format(course_name=course_title)
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        language = json.loads(response.choices[0].message.content)
        return language
    except Exception as e:
        print(f"Error in language check: {str(e)}")
        return "None"
        


def generate_coding_problems_for_week(week: Week) -> dict:
    try:
        material = week.materials.first()
        if not material or not material.summarized_material:
            raise ValueError("Material summary not generated yet")
    except Material.DoesNotExist:
        raise ValueError(f"No material found for week {week.week_number}")

    client = get_ai_client()
    raw_codes = []
    
    summarized_material = material.summarized_material
    chunks = textwrap.wrap(summarized_material, width=MAX_CHUNK_SIZE)
    language = week.course.language

    for chunk_index, chunk in enumerate(chunks):
        word_count = len(chunk.split())

        # Dynamic code count scaling (approx. 3 codes per 1000 words)
        codes_per_level = max(1, min(5, (word_count // 1000)))

        for difficulty in CODE_DIFFICULTIES:
            prompt = CODE_GENERATION_TEMPLATE.format(
                num_codes=codes_per_level,
                difficulty=difficulty,
                chunk=chunk,
                programming_language=language
            )

            try:
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
                raw_codes.extend(result['codes'])

            except Exception as e:
                print(f"[Chunk {chunk_index}] Error generating {difficulty} codes: {str(e)}")

                for _ in range(codes_per_level):
                    raw_codes.append({
                        "problem_statement": f"Sample {difficulty} statement about this section",
                        "solution": f"Sample {difficulty} solution",
                        "template_code": f"Sample {difficulty} template",
                        "difficulty": "E"
                    })

    # Cleanup existing questions
    Code.objects.filter(week=week).delete()

    # Create new questions
    codes_to_create = [
        Code(
            week=week,
            difficulty=q['difficulty'][0],
            problem_statement=q['problem_statement'],
            solution=q['solution'],
            template_code=q['template_code'],
        ) for q in raw_codes
    ]

    created_codes = Code.objects.bulk_create(codes_to_create)

    # Final distribution report
    difficulty_counts = {d: 0 for d in CODE_DIFFICULTIES}
    for q in raw_codes:
        difficulty_counts[q['difficulty']] += 1

    return {
        "week_id": week.id,
        "course": week.course.title,
        "total_codes": len(created_codes),
        "chunks_processed": len(chunks),
        "questions_per_chunk": codes_per_level,
        "difficulty_distribution": difficulty_counts,
        "average_codes_per_level": len(created_codes) // len(CODE_DIFFICULTIES)
    }
