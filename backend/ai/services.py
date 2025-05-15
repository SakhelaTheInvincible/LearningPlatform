import json
from api.models import Course, Question, Week, Material
from .client import get_ai_client
from .constants import QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, QUESTION_TYPE_CHOICES, DIFFICULTIES, DISTRIBUTIONS, SUMMARY_TEMPLATE, DIFFICULTY_MAPPING

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
