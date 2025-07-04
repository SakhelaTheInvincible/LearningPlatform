import json
from api.models import Course, Question, Week, Material, Code
from .client import get_ai_client
from .constants import (
    QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, QUESTION_TYPE_CHOICES,
    DIFFICULTIES,
    DIFFICULTY_MAPPING, ANSWER_COMPARISON_TEMPLATE, CODE_COMPARISON_TEMPLATE,
    CODE_DIFFICULTIES, CODE_GENERATION_TEMPLATE, CODE_SUMMARY_TEMPLATE, DISTRIBUTIONS
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
import platform

# Check CUDA availability and set device
system = platform.system()
if system == 'Darwin':  # macOS
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    if torch.backends.mps.is_available():
        device = "mps"
        print("Using MPS (Metal Performance Shaders)")
    else:
        device = -1  # Use CPU
        print("MPS not available, using CPU")
else:  # Windows or other OS
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
        with torch.no_grad():  # Disable gradient calculation
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
    print("Starting material summary generation...")
    chunks = textwrap.wrap(material, width=1024)
    print(f"Material split into {len(chunks)} chunks")

    try:
        print("Loading summarization model...")
        summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=device,
            torch_dtype=torch.float16 if device != -
            1 else torch.float32  # Use half precision if not CPU
        )
        print("Model loaded successfully")

        # Calculate optimal number of workers based on system
        cpu_count = os.cpu_count() or 4
        max_workers = min(4, cpu_count)  # Cap at 4 workers
        print(f"Using {max_workers} workers for processing")

        full_summary = []
        chunk_results = [None] * len(chunks)  # Pre-allocate results array

        def process_chunk(chunk_idx):
            try:
                chunk = chunks[chunk_idx]
                result = _summarize_chunk(chunk, summarizer)
                return chunk_idx, result
            except Exception as e:
                print(f"Error processing chunk {chunk_idx + 1}: {str(e)}")
                return chunk_idx, chunks[chunk_idx]

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            print("Starting parallel processing of chunks...")
            futures = [executor.submit(process_chunk, i)
                       for i in range(len(chunks))]

            for future in futures:
                try:
                    chunk_idx, result = future.result()
                    chunk_results[chunk_idx] = result
                    print(f"Processed chunk {chunk_idx + 1}/{len(chunks)}")
                except Exception as e:
                    print(f"Error getting result: {str(e)}")

        # Filter out None results and join
        full_summary = [r for r in chunk_results if r is not None]
        print("All chunks processed successfully")
        return "\n\n".join(full_summary)

    except Exception as e:
        print(f"Error in summary generation: {str(e)}")
        return material[:500] + "..."
    finally:
        # Clean up resources
        if 'summarizer' in locals():
            del summarizer
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            elif torch.backends.mps.is_available():
                torch.mps.empty_cache()


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
        question_types=", ".join(QUESTION_TYPE_CHOICES),
        distributions=DISTRIBUTIONS
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


def compare_coding_solutions(problem_statement: str, solution: str, user_solution: str, programming_language: str = "python") -> dict:
    """Compare coding question answers."""
    client = get_ai_client()
    prompt = CODE_COMPARISON_TEMPLATE.format(
        problem_statement=problem_statement,
        solution=solution,
        user_solution=user_solution,
        programming_language=programming_language
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        result = response.choices[0].message.content.split("|")
        return {
            'user_score': result[0],
            'hint': result[1]
        }

    except Exception as e:
        print(f"Error in coding answer comparison: {str(e)}")
        # Fallback to basic string comparison if AI fails
        return {
            'user_score': 0,
            'hint': str(e)
        }

def parse_code_lines(response_text):
    codes = []
    # Split on both ==== and --- to handle different AI output formats
    challenge_blocks = response_text.strip().split('==============')
    
    # If no ==== found, try ---
    if len(challenge_blocks) == 1:
        challenge_blocks = response_text.strip().split('---')

    for block in challenge_blocks:
        block = block.strip()
        if not block:
            continue

        try:
            print(f"Processing block: {block}...")
            # Extract sections using markers
            problem_statement = ""
            solution = ""
            template_code = ""
            difficulty = ""

            # Find problem statement
            if "Problem Statement" in block:
                problem_start = block.find("Problem Statement")
                # Look for next section marker
                next_section = min(
                    block.find("Solution") if "Solution" in block else len(block),
                    block.find("**Solution**") if "**Solution**" in block else len(block)
                )
                problem_statement = block[problem_start:next_section].replace(
                    "Problem Statement:", "").replace("**Problem Statement**:", "").strip()

            # Find solution
            if "Solution" in block:
                solution_start = block.find("Solution")
                if solution_start == -1:
                    solution_start = block.find("**Solution**")
                
                # Look for next section marker
                next_section = min(
                    block.find("Template") if "Template" in block else len(block),
                    block.find("**Template**") if "**Template**" in block else len(block)
                )
                solution = block[solution_start:next_section].replace(
                    "Solution:", "").replace("**Solution**:", "").strip()
                # Extract code from solution
                if "```" in solution:
                    code_start = solution.find("```") + 3
                    code_end = solution.rfind("```")
                    if code_end > code_start:
                        solution = solution[code_start:code_end].strip()

            # Find template
            if "Template" in block:
                template_start = block.find("Template")
                if template_start == -1:
                    template_start = block.find("**Template**")
                
                # Look for next section marker
                next_section = min(
                    block.find("Difficulty") if "Difficulty" in block else len(block),
                    block.find("**Difficulty**") if "**Difficulty**" in block else len(block)
                )
                template_code = block[template_start:next_section].replace(
                    "Template:", "").replace("**Template**:", "").strip()
                # Extract code from template
                if "```" in template_code:
                    code_start = template_code.find("```") + 3
                    code_end = template_code.rfind("```")
                    if code_end > code_start:
                        template_code = template_code[code_start:code_end].strip()

            # Find difficulty
            if "Difficulty" in block:
                difficulty_start = block.find("Difficulty")
                if difficulty_start == -1:
                    difficulty_start = block.find("**Difficulty**")
                difficulty = block[difficulty_start:].replace(
                    "Difficulty:", "").replace("**Difficulty**:", "").strip()

            # Validate required fields
            if not all([problem_statement, solution, template_code, difficulty]):
                print(f"Skipping block with missing fields:")
                print(f"  Problem: {bool(problem_statement)}")
                print(f"  Solution: {bool(solution)}")
                print(f"  Template: {bool(template_code)}")
                print(f"  Difficulty: {bool(difficulty)}")
                continue

            # Map difficulty to our format - handle both full words and abbreviations
            difficulty_map = {
                "Easy": "E",
                "Medium": "M", 
                "Hard": "H",
                "E": "E",
                "M": "M",
                "H": "H"
            }
            # Default to Medium if not found
            difficulty = difficulty_map.get(difficulty.strip()[0], "M")

            codes.append({
                "difficulty": difficulty,
                "problem_statement": problem_statement,
                "solution": solution,
                "template_code": template_code,
                'user_code': template_code
            })

        except Exception as e:
            print(f"Error parsing block: {block}\nError: {str(e)}")
            continue

    return codes


def _summarize_code_chunk(chunk: str, client, language: str) -> str:
    """Generate a focused summary for a single code chunk."""
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{
                "role": "user",
                "content": CODE_SUMMARY_TEMPLATE.format(
                    chunk=chunk,
                    language=language
                )
            }],
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in code chunk summary generation: {str(e)}")
        # Return original chunk if summarization fails
        return chunk


def generate_code_specific_summary(material: str, client, language: str) -> str:
    """Generate a focused summary for code generation using chunking and threading."""
    try:
        print("Starting code-specific summary generation...")
        chunks = textwrap.wrap(material, width=MAX_CHUNK_SIZE)
        print(f"Material split into {len(chunks)} chunks for code summary.")

        full_summary = []
        max_workers = 16

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(
                _summarize_code_chunk, chunk, client, language) for chunk in chunks]

            for i, future in enumerate(futures):
                try:
                    result = future.result()
                    full_summary.append(result)
                    print(f"Processed code summary chunk {i+1}/{len(chunks)}")
                except Exception as e:
                    print(
                        f"Error processing code summary chunk {i+1}: {str(e)}")
                    full_summary.append(chunks[i])

        print("All code summary chunks processed successfully.")
        return "\n\n".join(full_summary)

    except Exception as e:
        print(f"Error in code summary generation: {str(e)}")
        return material


def generate_coding_problems_for_week(week: Week) -> dict:
    """Generate balanced set of coding problems for a week."""
    # Validate input
    material = week.materials.first()
    if not material or not material.summarized_material:
        raise ValueError("Material summary required")

    client = get_ai_client()
    language = week.course.language

    # Generate focused summary
    code_summary = generate_code_specific_summary(
        material.summarized_material,
        client,
        language
    )

    # Dynamically set problems per difficulty based on summary length
    word_count = len(code_summary.split())
    if word_count < 1000:
        problems_per_difficulty = 1
    elif word_count < 3000:
        problems_per_difficulty = 2
    else:
        problems_per_difficulty = 3

    # Generate problems with balanced distribution
    prompt = CODE_GENERATION_TEMPLATE.format(
        num_codes=problems_per_difficulty,
        difficulties=", ".join(CODE_DIFFICULTIES),
        chunk=code_summary,
        programming_language=language,
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        codes = parse_code_lines(response.choices[0].message.content)

        # Validate generated codes
        if not codes:
            raise ValueError("No valid coding problems generated")

        # Ensure balanced distribution
        difficulty_counts = {diff: 0 for diff in CODE_DIFFICULTIES}
        for code in codes:
            difficulty_counts[code['difficulty']] += 1

        if not all(count == problems_per_difficulty for count in difficulty_counts.values()):
            print("Warning: Uneven difficulty distribution in generated problems")

        return {
            "week": week.pk,
            "codes": codes,
            "distribution": difficulty_counts
        }

    except Exception as e:
        print(f"Error in problem generation: {str(e)}")
        raise
