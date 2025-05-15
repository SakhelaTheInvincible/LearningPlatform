from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_material_summary, generate_questions_for_week, compare_answers
from api.models import Course, Week, Question, Material, User, Quiz
from api.serializers import CourseSerializer, QuestionSerializer, QuizSerializer, WeekSerializer
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


class MaterialQuizCreateAPIView(APIView):
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

            print("parsed text success")
            # Create Material object
            material = Material.objects.create(
                week=week,
                title=material_title or file.name,
                description=material_description,
                material=extracted_text,
                summarized_material=generate_material_summary(material=extracted_text),
            )
            print("material ai success")
            created_materials.append(material.id)
            
        # Create Questions
        generate_questions_for_week(week=week)
        print("week questions generated")
        # Create Quizes
        created_quizzes = []
        errors = []
        
        # Create quizzes for all difficulty levels
        for difficulty_code, difficulty_name in Quiz.DIFFICULTY_LEVEL_CHOICES:
            try:
                quiz = Quiz.create_quiz(week=week, difficulty=difficulty_code)
                created_quizzes.append({
                    'id': quiz.id,
                    'difficulty': difficulty_code,
                    'difficulty_display': difficulty_name,
                    'created_at': quiz.created_at
                })
            except Exception as e:
                errors.append({
                    'difficulty': difficulty_code,
                    'error': str(e)
                })
        
        response_data = {
            "status_quizes": "success",
            "created_quizzes": created_quizzes,
            "status": "success", 
            "created_materials": created_materials,
            "errors": errors if errors else None
        }
        print(response_data)

        if not created_quizzes and errors:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        return Response(response_data, status=status.HTTP_201_CREATED)

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
    
    
    
class WeekRetrieveAPIView(APIView):
    def get(self, request, title, selectedWeek):
        # Get the course
        course = get_object_or_404(Course.objects.prefetch_related('weeks', 'weeks__materials', 'weeks__quizzes'), title=title)
        
        # Get the specific week
        week = get_object_or_404(course.weeks, week_number=selectedWeek)
        
        # Serialize the week data
        serializer = WeekSerializer(week)
        
        return Response(serializer.data)

class QuizAnswerCheckView(APIView):
    def post(self, request, title, selectedWeek):
        quiz_id = request.data.get('quiz_id')
        questions = request.data.get('questions', {})
        
        if not quiz_id or not questions:
            return Response(
                {"error": "quiz_id and questions object are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get the quiz and verify it belongs to the correct week/course
        quiz = get_object_or_404(
            Quiz.objects.select_related('week__course').prefetch_related('questions'),
            id=quiz_id,
            week__course__title=title,
            week__week_number=selectedWeek
        )
        
        # Get all questions in a single query
        quiz_questions = {
            str(q.id): q for q in quiz.questions.all()
        }
        
        results = {}
        total_correct = 0
        
        # Process each question
        for question_id, user_answer in questions.items():
            question = quiz_questions.get(str(question_id))
            
            if not question:
                results[question_id] = {
                    "error": "Question not found in this quiz"
                }
                continue
            
            # Use AI comparison for open and coding questions
            if question.question_type in ['open', 'coding']:
                comparison = compare_answers(
                    question_type=question.question_type,
                    correct_answer=question.answer,
                    user_answer=user_answer
                )
                is_correct = comparison['is_correct']
            else:
                is_correct = user_answer.lower().strip() == question.answer.lower().strip()
                
            if is_correct:
                total_correct += 1
                
            results[question_id] = {
                'answer': 'correct' if is_correct else 'wrong',
                'real_answer': question.answer,
                'explanation': question.explanation
            }
        
        # Calculate score percentage
        total_questions = len(questions)
        score_percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0
        
        # Update quiz score if it's higher than previous
        if score_percentage > quiz.user_score:
            quiz.user_score = score_percentage
            quiz.save(update_fields=['user_score'])
        
        return Response(results)
    