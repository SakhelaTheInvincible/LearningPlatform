from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_questions
from api.models import Course, Week, Question, Material, User
from api.serializers import CourseSerializer, QuestionSerializer
from file_manager.file_manager import extract_text
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import generics
from api.serializers import OnlyCourseSerializer,UserSerializer

import os



class OnlyCourseListAPIView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = OnlyCourseSerializer

class UserCreateAPIView(generics.CreateAPIView):
    serializer_class = UserSerializer

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username' 

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


    
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
            title=request.data['name'],
            duration_weeks=len(request.data['weeks']),
            estimated_time=50,
            level='beginner',
            description="amazing spiderman"
        )
            
        weeks = []
        materials = []
        for week_num, week_data in enumerate(request.data['weeks'], start=1):
            week = Week(
                course=course,
                week_number=week_num
            )
            weeks.append(week)
            
            materials.append(Material(
                week=week,
                title=f"Week {week_num} Material",
                material=week_data.get('material', ''),
                description=week_data.get('description', '')
            ))
        
        created_weeks = Week.objects.bulk_create(weeks)
        
        Material.objects.bulk_create(materials)
        
        # questions_count = 0
        # for week in created_weeks:
        #     result = generate_questions(week)
        #     questions_count += result['questions_generated']
        
        return Response({
            "status": "success",
            "course_id": course.id,
            "weeks_created": len(created_weeks),
            "materials_created": len(materials),
            "questions_generated": 0,
            "message": "Course, materials, and questions created successfully"
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
                "material": week.materials.material,
                "summarized_material": week.materials.summarized_material
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
        weeks = Week.objects.filter(course=course).select_related('material')
        if not weeks.exists():
            return Response(
                {"error": "No weeks found for this course"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        questions_count = 0
        materials_updated = 0
        
        for week in weeks:
            try:
                result = generate_questions(week)
                results.append({
                    "week": week.week_number,
                    **result
                })
                questions_count += result['questions_generated']
                materials_updated += 1
            except Exception as e:
                results.append({
                    "week": week.week_number,
                    "error": str(e),
                    "status": "failed"
                })
        
        return Response({
            "status": "success",
            "summary": {
                "total_weeks_processed": len(weeks),
                "weeks_succeeded": len([r for r in results if 'error' not in r]),
                "weeks_failed": len([r for r in results if 'error' in r]),
                "total_questions_generated": questions_count,
                "total_materials_updated": materials_updated
            },
            "detailed_results": results
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_weeks_view(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
        
        # Check if files are provided
        if not request.FILES:
            return Response(
                {"error": "No files provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process each file
        results = []
        
        for week_num, file in enumerate(request.FILES.values(), start=1):
            # Save the file temporarily
            file_path = default_storage.save(f'temp_{file.name}', ContentFile(file.read()))
            
            try:
                # Extract text from the file
                text_content = extract_text(file_path)
                
                # Try to get existing week or create new one
                week, created = Week.objects.get_or_create(
                    course=course,
                    week_number=week_num,
                    defaults={'material': text_content}
                )
                
                if not created:
                    # Update existing week's material
                    week.summarized_material = text_content
                    week.save()
                
                results.append({
                    "week_number": week_num,
                    "status": "created" if created else "updated",
                    "file_name": file.name
                })
                
            except Exception as e:
                results.append({
                    "week_number": week_num,
                    "status": "error",
                    "error": str(e),
                    "file_name": file.name
                })
            
            finally:
                # Clean up temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        return Response({
            "status": "success",
            "course_id": course_id,
            "results": results
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )