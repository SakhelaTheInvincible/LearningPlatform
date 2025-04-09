from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_questions
from api.models import Course

@api_view(['GET'])
def hello_api_view(request):
    return Response({"message": "Hello from Django API!"})

@api_view(['GET', 'POST'])
def questions_view(request):
    subject = request.GET.get('subject', 'Introduction to Python')
    
    if request.method == 'GET':
        try:
            course = Course.objects.get(name=subject)
            questions = {}
            for question in course.questions.all():
                if question.get_difficulty_display() not in questions:
                    questions[question.get_difficulty_display()] = []
                questions[question.get_difficulty_display()].append({
                    "question": question.question_text,
                    "answer": question.answer,
                    "explanation": question.explanation
                })
            return Response(questions)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'POST':
        questions = generate_questions(subject)
        return Response(questions, status=status.HTTP_201_CREATED)