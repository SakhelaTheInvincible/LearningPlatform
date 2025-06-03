from rest_framework.decorators import api_view, APIView, action
from rest_framework.response import Response
from rest_framework import status
from ai.services import generate_material_summary, generate_questions_for_week, compare_answers, check_language, generate_coding_problems_for_week
from api.models import Course, Week, Question, Material, User, Quiz, Code
from api.serializers import CourseSerializer, QuestionSerializer, QuizSerializer, WeekSerializer
from file_manager.file_manager import extract_text
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import generics
from api.serializers import (OnlyCourseSerializer,
                             CourseSerializer,
                             UserSerializer, UserSignUpSerializer,
                             PasswordChangeSerializer, UserPublicSerializer, AdminSerializer, CourseCreateSerializer,
                             CourseListSerializer, WeekCreateSerializer, MaterialCreateSerializer)

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
import os
from django.conf import settings
from django.db.models import Q


from rest_framework import mixins, viewsets


# USER SECTION
# ====================#
class UserViewSet(mixins.
                  UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action == "set_password":
            return PasswordChangeSerializer
        else:
            return UserSerializer

    def get_object(self):
        return self.request.user
    # no need to override get_queryset was I will not be using several objects from db

    @action(detail=False, methods=["GET", "PUT", "DELETE"])
    def me(self, request, *args, **kwargs):
        try:
            user = request.user
            if request.method == "PUT":
                serializer = self.get_serializer(
                    user, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
            elif request.method == "DELETE":
                self.perform_destroy(user)
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                serializer = self.get_serializer(user)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["PUT", "PATCH"])
    def set_password(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Password changed successfully.'})
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)


class UserSignUpViewSet(mixins.CreateModelMixin,
                        viewsets.GenericViewSet):
    queryset = User.objects.all()
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = UserSignUpSerializer


# for testing Purposes!!!


class UserPublicViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class AdminUserViewSet(mixins.ListModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.UpdateModelMixin,
                       viewsets.GenericViewSet):
    # Or a more detailed serializer if you want
    serializer_class = AdminSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        # get all User except admin  and self
        return User.objects.exclude(is_superuser=True).exclude(id=self.request.user.id)

    @action(detail=False, methods=["GET"], url_path='filter')
    def filter(self, request, *args, **kwargs):
        username = request.query_params.get("username", "")
        order_by = request.query_params.get("order_by", "date_joined")
        try:
            queryset = User.objects.exclude(is_superuser=True).exclude(
                id=self.request.user.id).filter(username__icontains=username).order_by(f'-{order_by}')
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], url_path='set_password')
    def set_password(self, request, pk=None):
        try:
            queryset = User.objects.all()
            instance = get_object_or_404(queryset, pk=pk)
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            if not new_password:
                return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not confirm_password:
                return Response({'error': 'confirm_password is required'}, status=status.HTTP_400_BAD_REQUEST)
            if new_password != confirm_password:
                return Response({'error': 'Passwords do not match '}, status=status.HTTP_400_BAD_REQUEST)
            instance.password = make_password(password=new_password)
            instance.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

    def update(self, request, pk, *args, **kwargs):
        try:
            queryset = User.objects.all()
            instance = get_object_or_404(queryset, pk=pk)
            serializer = self.get_serializer(
                instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk, *args, **kwargs):
        queryset = User.objects.all()
        instance = get_object_or_404(queryset, pk=pk)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

# ====================#

# Course section
# ====================#


class CourseViewSet(mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseCreateSerializer
        else:
            return CourseListSerializer

    def get_queryset(self):
        self.queryset = Course.objects.filter(user=self.request.user)
        # self.queryset = Course.objects.all()
        return super().get_queryset()
# ====================#


# Week section
# ====================#

class WeekViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = WeekCreateSerializer
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        user = request.user
        queryset = Course.objects.all()
        title_slug = self.kwargs['title_slug']
        course = get_object_or_404(queryset, title_slug=title_slug)

        if course.user != user:
            return Response({'detail': 'Not allowed to add weeks to this course.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# ====================#


# Material section
# ====================#
class MaterialViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = MaterialCreateSerializer
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        user = request.user
        queryset = Course.objects.all()
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']
        course = get_object_or_404(queryset, title_slug=title_slug)

        if course.user != user:
            return Response({'detail': 'Not allowed to add weeks to this course.'}, status=status.HTTP_403_FORBIDDEN)

        # get the correct week
        queryset = Week.objects.all()
        week = get_object_or_404(
            queryset, course=course, week_number=week_number)
        # we know  that request
        file = request.FILES.get('material')

        file_path = default_storage.save(
            f'temp_{file.name}', ContentFile(file.read()))
        full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

        try:
            material = extract_text(full_file_path)
            summarized_material = generate_material_summary(
                material=material)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            serializer.save(material=material,
                            summarized_material=summarized_material, week=week)

            headers = self.get_success_headers(serializer.data)
        finally:
            # Clean up temp file
            if os.path.exists(full_file_path):
                os.remove(full_file_path)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# ====================#


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
                summarized_material=generate_material_summary(
                    material=extracted_text),
            )
            print("material ai success")
            created_materials.append(material.id)

        # If course is programming language, then create coding challanges:
        if course.language != 'None':
            generate_coding_problems_for_week(week=week)
            print("Coding Challanges Generated")

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
        title = serializer.validated_data['title']

        # create course, but also check if created course is about some programming language
        serializer.save(user=self.request.user, language=check_language(title))


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

    #     return


class WeekRetrieveAPIView(APIView):
    def get(self, request, title, selectedWeek):
        # Get the course
        course = get_object_or_404(Course.objects.prefetch_related(
            'weeks', 'weeks__materials', 'weeks__quizzes', 'weeks__codes'), title=title)

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
            Quiz.objects.select_related(
                'week__course').prefetch_related('questions'),
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
        score_percentage = (total_correct / total_questions *
                            100) if total_questions > 0 else 0

        # Update quiz score if it's higher than previous
        if score_percentage > quiz.user_score:
            quiz.user_score = score_percentage
            quiz.save(update_fields=['user_score'])

        return Response(results)


class CodeCheckView(APIView):
    def post(self, request, title, selectedWeek):
        code_id = request.data.get('code_id')
        solution = request.data.get('solution')

        if not code_id or not solution:
            return Response(
                {"error": "code_id and solution are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the code and verify it belongs to the correct week/course
        code = get_object_or_404(
            Code.objects.select_related('week__course'),
            id=code_id,
            week__course__title=title,
            week__week_number=selectedWeek
        )

        comparison = compare_answers(
            question_type="coding",
            correct_answer=code.solution,
            user_answer=solution
        )
        user_score = comparison['user_score']
        error = comparison['error']

        # Update code score if it's higher than previous
        if user_score > code.user_score:
            code.user_score = user_score
            code.save(update_fields=['user_score'])

        return Response({
            "user_score": user_score,
            "error": error
        })
