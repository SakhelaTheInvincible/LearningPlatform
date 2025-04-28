from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_questions
from api.models import Course, Week, Question
from api.serializers import CourseSerializer, QuestionSerializer

@api_view(['GET'])
def hello_api_view(request):
    return Response({"message": "Hello from Django API!"})
    
@api_view(['GET', 'POST'])
def course_view(request, course_id=None):
    if request.method == 'GET':
        try:
            course = Course.objects.prefetch_related('weeks').get(id=course_id)
            serializer = CourseSerializer(course)
            return Response({
                "status": "success",
                "data": serializer.data
            })
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    elif request.method == 'POST':
        if not request.data.get('name') or not request.data.get('weeks'):
            return Response(
                {"error": "Name and weeks are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course = Course.objects.create(
            name=request.data['name'],
            duration_weeks=len(request.data['weeks'])
        )
        
        weeks = []
        for week_num, week_data in enumerate(request.data['weeks'], start=1):
            weeks.append(Week(
                course=course,
                week_number=week_num,
                material=week_data.get('material', '')
            ))
        
        Week.objects.bulk_create(weeks)
        
        return Response({
            "status": "success",
            "course_id": course.id,
            "weeks_created": len(weeks)
        }, status=status.HTTP_201_CREATED)
        

@api_view(['GET'])
def get_week_view(request, course_id, week_number):
    try:
        week = Week.objects.get(course_id=course_id, week_number=week_number)
        questions = Question.objects.filter(week=week)
        serializer = QuestionSerializer(questions, many=True)
        
        return Response({
            "status": "success",
            "week": {
                "number": week.week_number,
                "material": week.material,
                "summarized_material": week.summarized_material
            },
            "count": len(serializer.data),
            "questions": serializer.data
        })
        
    except Week.DoesNotExist:
        return Response(
            {"error": "Week not found"},
            status=status.HTTP_404_NOT_FOUND
        )
        
        
@api_view(['POST'])
def generate_all_questions(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
        weeks = Week.objects.filter(course=course)
        results = []
        
        for week in weeks:
            results.append({
                "week": week.week_number,
                **generate_questions(week)
            })
        
        return Response({
            "status": "success",
            "results": results
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )