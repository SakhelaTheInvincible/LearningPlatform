import json
from api.models import Course, Question, Week, Material, Code
from .client import get_ai_client
from .constants import (
    QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, QUESTION_TYPE_CHOICES, 
    DIFFICULTIES, QUESTIONS_PER_LEVEL, SUMMARY_TEMPLATE, 
    DIFFICULTY_MAPPING, ANSWER_COMPARISON_TEMPLATE, DISTRIBUTIONS, CHECK_LANGUAGE_TEMPLATE, CODE_COMPARISON_TEMPLATE,
    CODE_DIFFICULTIES, CODE_GENERATION_TEMPLATE
)

import textwrap
from typing import Dict, List, Tuple


def generate_material_summary(material: str) -> str:
    client = get_ai_client()
    chunks = textwrap.wrap(material, width=MAX_CHUNK_SIZE)
    full_summary = []
    last_sentence = ""
    
    for chunk in chunks:
        # Add context if available
        prompt = SUMMARY_TEMPLATE.format(chunk=chunk)
        if last_sentence:
            prompt = f"Context: {last_sentence}\n\n" + prompt
        
        summary_response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{
                "role": "user", 
                "content": prompt
            }],
            temperature=0.5
        )
        
        chunk_summary = summary_response.choices[0].message.content
        full_summary.append(chunk_summary)
        
        sentences = chunk_summary.split('.')
        last_sentence = sentences[-1].strip() if sentences else ""
        if last_sentence and not last_sentence.endswith('.'):
            last_sentence += '.'
    
    return "\n\n".join(full_summary)
    
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

    for chunk_index, chunk in enumerate(chunks):
        word_count = len(chunk.split())

        # Dynamic question count scaling (approx. 10 questions per 1000 words)
        questions_per_level = max(2, min(12, (word_count // 1000) * 2))

        for difficulty in DIFFICULTIES:
            prompt = QUESTION_GEN_TEMPLATE.format(
                num_questions=questions_per_level,
                difficulty=difficulty,
                chunk=chunk,
                question_types=QUESTION_TYPE_CHOICES,
                distribution=DISTRIBUTIONS
            )

            try:
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
                raw_questions.extend(result['questions'])

            except Exception as e:
                print(f"[Chunk {chunk_index}] Error generating {difficulty} questions: {str(e)}")

                for _ in range(questions_per_level):
                    raw_questions.append({
                        "question": f"Sample {difficulty} question about this section",
                        "answer": f"Sample {difficulty} answer",
                        "explanation": f"Sample {difficulty} explanation",
                        "type": "multiple_choice",
                        "difficulty": DIFFICULTY_MAPPING[difficulty]
                    })

    # Cleanup existing questions
    Question.objects.filter(week=week).delete()

    # Create new questions
    questions_to_create = [
        Question(
            week=week,
            difficulty=DIFFICULTY_MAPPING[q['difficulty']],
            question_type=q.get('type', ''),
            question_text=q['question'],
            answer=q['answer'],
            explanation=q['explanation'],
        ) for q in raw_questions
    ]

    created_questions = Question.objects.bulk_create(questions_to_create)

    # Final distribution report
    difficulty_counts = {d: 0 for d in DIFFICULTIES}
    for q in raw_questions:
        difficulty_counts[q['difficulty']] += 1

    return {
        "week_id": week.id,
        "course": week.course.title,
        "total_questions": len(created_questions),
        "chunks_processed": len(chunks),
        "questions_per_chunk": questions_per_level,
        "difficulty_distribution": difficulty_counts,
        "average_questions_per_level": len(created_questions) // len(DIFFICULTIES)
    }

def compare_answers(question_type: str, correct_answer: str, user_answer: str) -> dict:
    if question_type not in ['open', 'coding']:
        raise ValueError("Question type must be 'open' or 'coding'")
        
    client = get_ai_client()
    prompt = ""
    if question_type == 'open':
        prompt = ANSWER_COMPARISON_TEMPLATE.format(
            correct_answer=correct_answer,
            user_answer=user_answer
        )
    else:
        prompt = CODE_COMPARISON_TEMPLATE.format(
            correct_answer=correct_answer,
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
        if question_type == 'open':
            return {
                'is_correct': bool(result)
            }
            
        else:
            return {
                'user_score': result['user_score'],
                'error': result['error']
            }
            
        
    except Exception as e:
        print(f"Error in answer comparison: {str(e)}")
        # Fallback to basic string comparison if AI fails
        return {
            'is_correct': user_answer.lower().strip() == correct_answer.lower().strip()
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