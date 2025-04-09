import json
from api.models import Course, Question
from .client import get_ai_client
from .constants import QUESTION_GEN_TEMPLATE, DIFFICULTIES, DIFFICULTY_LEVEL

def generate_questions(subject: str, questions_per_level: int = 2):
    client = get_ai_client()
    
    # Get or create course (but always regenerate questions)
    course, created = Course.objects.get_or_create(name=subject)
    
    # Delete existing questions for this course to regenerate them
    Question.objects.filter(course=course).delete()
    
    all_questions = {}
    
    for difficulty in DIFFICULTIES:
        prompt = QUESTION_GEN_TEMPLATE.format(
            subject=subject,
            difficulty=difficulty,
            num_questions=questions_per_level
        )

        try:
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                stream=False
            )
            
            print(f"response generated for {difficulty} difficulty")
            
            # Parse and validate response
            try:
                questions = json.loads(response.choices[0].message.content)
                if not isinstance(questions, list):
                    raise ValueError("Response is not a JSON array")
                
                # Save questions to database
                for q in questions:
                    Question.objects.create(
                        course=course,
                        difficulty=DIFFICULTY_LEVEL[difficulty],
                        question_text=q["question"],
                        answer=q["answer"],
                        explanation=q["explanation"],
                    )
                all_questions[difficulty] = questions
                
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"Error processing {difficulty} response: {str(e)}")
                # Fallback to default questions if API fails
                questions = [{
                    "question": f"Sample {difficulty} question about {subject}",
                    "answer": f"Sample {difficulty} answer",
                    "explanation": f"Sample {difficulty} explanation"
                }]
                all_questions[difficulty] = questions
                
        except Exception as e:
            print(f"API call failed for {difficulty}: {str(e)}")
            # Fallback if API call completely fails
            questions = [{
                "question": f"Sample {difficulty} question about {subject}",
                "answer": f"Sample {difficulty} answer",
                "explanation": f"Sample {difficulty} explanation"
            }]
            all_questions[difficulty] = questions
            
    return all_questions