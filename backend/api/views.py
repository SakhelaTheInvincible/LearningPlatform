from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_questions
from api.models import Course, Week, Question, Material, User
from api.serializers import CourseSerializer, QuestionSerializer
from file_manager.file_manager import extract_text
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import generics
from api.serializers import OnlyCourseSerializer, UserSerializer, PasswordChangeSerializer, CourseSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
import os
from django.conf import settings
from django.db.models import Q


class MaterialCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, courseTitle, selectedWeek, *args, **kwargs):
        user = request.user
        title = courseTitle
        week_number = selectedWeek

        # 1. Find the course
        course = get_object_or_404(Course, user=user, title=title)

        # 2. Find or create the week
        week, created = Week.objects.get_or_create(
            course=course, week_number=week_number)

        # 3. Handle files
        files = request.FILES.getlist('file')
        material_title = request.data.get('title', '')
        material_description = request.data.get('description', '')

        created_materials = []
        for file in files:
            # Save file temporarily and extract text
            file_path = default_storage.save(
                f'temp_{file.name}', ContentFile(file.read()))
            full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

            try:
                extracted_text = extract_text(full_file_path)
            finally:
                # Clean up temp file
                if os.path.exists(full_file_path):
                    os.remove(full_file_path)

            # Create Material object
            material = Material.objects.create(
                week=week,
                title=material_title or file.name,
                description=material_description,
                material=extracted_text,
                summarized_material="",  # You can add summarization logic if needed
            )
            created_materials.append(material.id)

        return Response(
            {"status": "success", "created_materials": created_materials},
            status=status.HTTP_201_CREATED
        )
    # update would be very Interesting what should happen to corresponding week when updating material
    # meaning    material <- week -> questions now as material is updated corresponding questions via week
    # becomes obsolete


class OnlyCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = OnlyCourseSerializer
    parser_classes = (MultiPartParser, FormParser)
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print(request.data)
        print(self.request.user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OnlyCourseListAPIView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = OnlyCourseSerializer


class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.prefetch_related("weeks", "weeks__materials")
    serializer_class = CourseSerializer
    lookup_field = 'title'
    lookup_url_kwarg = 'title'

    # def get_object(self):
    #     """
    #     Returns the object the view is displaying.

    #     You may want to override this if you need to provide non-standard
    #     queryset lookups.  Eg if objects are referenced using multiple
    #     keyword arguments in the url conf.
    #     """
    #     queryset = self.filter_queryset(self.get_queryset())

    #     look_up = Q(user=self.request.user) & Q(
    #         title=self.kwargs.get("title"))
    #     obj = get_object_or_404(queryset, look_up)

    #     # May raise a permission denied
    #     self.check_object_permissions(self.request, obj)

    #     return obj

class UserCreateAPIView(generics.CreateAPIView):
    serializer_class = UserSerializer


class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def get_object(self):
        # Always return the authenticated user
        return self.request.user


class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'detail': 'Both old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)



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
            file_path = default_storage.save(
                f'temp_{file.name}', ContentFile(file.read()))

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
