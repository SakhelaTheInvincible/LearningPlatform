import json
from api.models import Course, Question, Week
from .client import get_ai_client
from .constants import QUESTION_GEN_TEMPLATE, MAX_CHUNK_SIZE, DIFFICULTY_LEVEL, DIFFICULTIES, QUESTIONS_PER_LEVEL, SUMMARY_TEMPLATE, DIFFICULTY_MAPPING

import textwrap
from typing import Dict, List, Tuple

def process_material_chunks(material: str, subject: str, week_num: int, questions_per_level: int = 2) -> Tuple[str, List[Dict]]:
    client = get_ai_client()
    chunks = textwrap.wrap(material, width=MAX_CHUNK_SIZE)
    QUESTIONS_PER_LEVEL = questions_per_level
    
    full_summary = []
    all_questions = []
    context_hint = f"Week {week_num} of {subject}"
    
    for chunk in chunks:
        summary_response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{
                "role": "user", 
                "content": SUMMARY_TEMPLATE.format(chunk=chunk)
            }],
            temperature=0.5
        )
        chunk_summary = summary_response.choices[0].message.content
        full_summary.append(chunk_summary)
        
        for difficulty in DIFFICULTIES:
            prompt = QUESTION_GEN_TEMPLATE.format(
                num_questions=QUESTIONS_PER_LEVEL,
                difficulty=difficulty,
                context_hint=context_hint,
                chunk=chunk_summary
            )
            
            try:
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
                all_questions.extend(result['questions'])
                context_hint = result.get('continuation_marker', '')
                
            except Exception as e:
                print(f"Error generating {difficulty} questions: {str(e)}")
                all_questions.append({
                    "question": f"Sample {difficulty} question about this section",
                    "answer": f"Sample {difficulty} answer",
                    "explanation": f"Sample {difficulty} explanation",
                    "type": "multiple_choice",
                    "difficulty": DIFFICULTY_MAPPING[difficulty]
                })
    
    return "\n\n".join(full_summary), all_questions

def generate_questions(week: Week, questions_per_level: int = QUESTIONS_PER_LEVEL):
    summary, raw_questions = process_material_chunks(
        material=week.material,
        subject=week.course.name,
        week_num=week.week_number,
        questions_per_level=questions_per_level
    )
    
    week.summarized_material = summary
    week.save()
    
    questions_to_create = []
    for q in raw_questions:
        question_type = q.get('type', '')[:15]
        
        questions_to_create.append(Question(
            week=week,
            difficulty=DIFFICULTY_MAPPING[q['difficulty']],
            question_type=question_type,
            question_text=q['question'],
            answer=q['answer'],
            explanation=q['explanation']
        ))
    
    Question.objects.bulk_create(questions_to_create)
    
    return {
        "summary_length": len(summary),
        "questions_generated": len(questions_to_create),
    }