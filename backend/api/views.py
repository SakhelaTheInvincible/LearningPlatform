from rest_framework.decorators import api_view, APIView, action
from rest_framework.response import Response
from rest_framework import status
import random
from ai.services import generate_material_summary, generate_questions_for_week, compare_open_answers, check_language, generate_coding_problems_for_week
from api.models import Course, Week, Question, Material, User, Quiz, Code
from api.serializers import CourseSerializer, QuestionSerializer, QuizSerializer, WeekSerializer
from file_manager.file_manager import extract_text, process_material_file
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import generics
from api.serializers import (CourseSerializer,
                             UserSerializer, UserSignUpSerializer,
                             PasswordChangeSerializer, UserPublicSerializer, AdminSerializer, CourseCreateSerializer, CourseRetrieveSerializer,
                             CourseListSerializer, WeekCreateSerializer, MaterialCreateSerializer,
                             QuestionCreateSerializer, QuizCreateSerializer, CodeSerializer, CodeCreateSerializer, QuizListSerializer, QuizSerializer)

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
import os
from django.conf import settings
from django.db.models import Q

from api.pagination import StandardResultsSetPagination
from rest_framework import mixins, viewsets
from django.db import transaction
from concurrent.futures import ThreadPoolExecutor
from api.permissions import IsCourseOwner, IsWeekOwner, IsMaterialOwner, IsQuizOwner


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
        serializer_map = {
            'set_password': PasswordChangeSerializer,
        }
        return serializer_map.get(self.action, UserSerializer)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=["GET", "PUT", "DELETE"])
    def me(self, request, *args, **kwargs):
        try:
            user = self.get_object()
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = UserSignUpSerializer

    def create(self, request, *args, **kwargs):

        is_superuser = request.query_params.get(
            'is_superuser', 'false').lower() == 'true'
        if request.user.is_anonymous and is_superuser:
            return Response(
                {"detail": "You do not have permission to create superusers."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_user = self.perform_create(serializer)

        if request.user.is_superuser and is_superuser:
            new_user.is_superuser = True
            new_user.is_staff = True
            new_user.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        return serializer.save()

# for testing Purposes!!!


class UserPublicViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

#


class AdminUserViewSet(mixins.ListModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.UpdateModelMixin,
                       viewsets.GenericViewSet):
    serializer_class = AdminSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    # Whitelist of allowed fields for ordering
    ALLOWED_ORDER_FIELDS = {
        'username', 'email', 'first_name', 'last_name', 'date_joined',
        '-username', '-email', '-first_name', '-last_name', '-date_joined'
    }

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        return User.objects.exclude(
            is_superuser=True
        ).exclude(
            id=self.request.user.id
        )

    @action(detail=False, methods=["GET"], url_path='filter')
    def filter(self, request, *args, **kwargs):
        username = request.query_params.get("username")
        order_by = request.query_params.get("order_by", "date_joined")

        # Start with base queryset
        queryset = self.get_queryset()

        # Apply filters
        if username:
            queryset = queryset.filter(username__icontains=username)

        # Validate and apply ordering
        if order_by not in self.ALLOWED_ORDER_FIELDS:
            return Response(
                {'error': f'Invalid ordering field. Allowed fields are: {", ".join(sorted(self.ALLOWED_ORDER_FIELDS))}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = queryset.order_by(order_by)

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'], url_path='set_password')
    def set_password(self, request, pk=None):
        try:
            queryset = self.get_queryset()
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
            queryset = self.get_queryset()
            instance = get_object_or_404(queryset, pk=pk)
            serializer = self.get_serializer(
                instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk, *args, **kwargs):
        queryset = self.get_queryset()
        instance = get_object_or_404(queryset, pk=pk)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

# ====================#

# Course section
# ====================#


class CourseViewSet(mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
    lookup_field = 'title_slug'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsCourseOwner]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    ALLOWED_ORDER_FIELDS = {
        'title', 'created_at',
        '-title', '-created_at',
    }

    def get_serializer_class(self):
        serializer_map = {
            'create': CourseCreateSerializer,
            'retrieve': CourseRetrieveSerializer,
        }
        return serializer_map.get(self.action, CourseListSerializer)

    def get_object(self):
        user = self.request.user
        title_slug = self.kwargs.get(self.lookup_field)
        queryset = Course.objects.prefetch_related(
            'weeks',
            'weeks__materials'
        ).select_related('user').filter(
            title_slug=title_slug,
            user=user
        )
        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = Course.objects.select_related('user')
        user = self.request.user
        queryset_map = {
            'list': Course.objects.select_related('user').filter(user=user)
        }
        return queryset_map.get(self.action, queryset)

    @action(detail=False, methods=["GET"], url_path='filter')
    def filter(self, request, *args, **kwargs):
        title = request.query_params.get("title")
        order_by = request.query_params.get("order_by", "created_at")

        filters = Q(user=self.request.user)
        if title:
            filters &= Q(title__icontains=title)

        queryset = self.get_queryset().filter(filters)

        if order_by not in self.ALLOWED_ORDER_FIELDS:
            return Response(
                {'error': 'Invalid ordering field'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = queryset.order_by(order_by)

        try:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Error processing request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ====================#


# Week section
# ====================#

class WeekViewSet(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):
    queryset = Week.objects.all()
    lookup_field = 'week_number'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWeekOwner]
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    # pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        serializer_map = {
            'create': WeekCreateSerializer,
            'retrieve': WeekSerializer
        }
        return serializer_map.get(self.action, WeekSerializer)

    def create(self, request, *args, **kwargs):
        user = request.user
        title_slug = self.kwargs['title_slug']
        queryset = Course.objects.select_related('user').filter(
            title_slug=title_slug)
        course = get_object_or_404(queryset)
        if course.user != user:
            return Response({'detail': 'Not allowed to add weeks to this course.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_object(self):
        user = self.request.user
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs[self.lookup_field]
        queryset = Week.objects.prefetch_related('materials').select_related(
            'course',
            'course__user').filter(
            course__title_slug=title_slug,
            week_number=week_number,
            course__user=user
        )
        obj = get_object_or_404(queryset)

        self.check_object_permissions(self.request, obj)
        return obj

# ====================#


# Material section
# ====================#
class MaterialViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = MaterialCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def process_material_file(self, file):
        """Process uploaded material file and return extracted text and summary. 
        Args:
            file: Uploaded file object
            week: Week instance to associate with material      
        Returns:
            tuple: (extracted_text, summarized_text)       
        Raises:
            ValueError: If file processing fails
        """
        return process_material_file(file)

    def create(self, request, *args, **kwargs):
        try:
            print("Starting material creation process...")
            user = request.user
            title_slug = self.kwargs['title_slug']
            week_number = self.kwargs['week_number']

            # Get week with related data
            queryset = Week.objects.select_related('course', 'course__user').filter(
                course__title_slug=title_slug,
                week_number=week_number
            )
            week = get_object_or_404(queryset)

            print(
                f"Processing request for course: {title_slug}, week: {week_number}")

            # Check permissions
            if week.course.user != user:
                return Response(
                    {'detail': 'Not allowed to add materials to this course.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validate file
            file = request.FILES.get('material')
            if not file:
                return Response(
                    {'detail': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file extension
            allowed_extensions = {'.txt', '.docx', '.pdf', '.md', '.rtf'}
            file_ext = os.path.splitext(file.name)[1].lower()
            if file_ext not in allowed_extensions:
                return Response(
                    {'detail': f'Unsupported file type. Allowed types: {", ".join(allowed_extensions)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process file
            try:
                material, summarized_material = self.process_material_file(
                    file)
            except ValueError as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create material
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save(
                material=material,
                summarized_material=summarized_material,
                week=week
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Exception as e:
            print(f"Error in material creation: {str(e)}")
            return Response(
                {'detail': f'Error processing material: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ====================#

# Question section
# ====================#


class QuestionViewSet(mixins.CreateModelMixin,
                      viewsets.GenericViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        serializer_map = {
            'create': QuestionCreateSerializer
        }
        return serializer_map.get(self.action, QuestionSerializer)

    def create(self, request, *args, **kwargs):

        user = request.user
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']

        # Get week with related data
        queryset = Week.objects.select_related('course', 'course__user').filter(
            course__title_slug=title_slug,
            week_number=week_number
        )
        week = get_object_or_404(queryset)

        if week.course.user != user:
            return Response({'detail': 'Not allowed to add Questions to this course.'}, status=status.HTTP_403_FORBIDDEN)

        question_data = generate_questions_for_week(week=week)
        serializer = self.get_serializer(many=True, data=question_data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
# ====================#


# Quiz section
# ====================#
class QuizViewSet(mixins.RetrieveModelMixin,
                  mixins.ListModelMixin,
                  mixins.UpdateModelMixin,
                  viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsQuizOwner]
    lookup_field = 'difficulty'

    def get_serializer_class(self):
        serializer_map = {
            'create_quizzes': QuizCreateSerializer,
            'list': QuizListSerializer,
        }
        return serializer_map.get(self.action, QuizSerializer)

    def get_object(self):
        user = self.request.user
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']
        difficulty = self.kwargs[self.lookup_field]
        queryset = Quiz.objects.prefetch_related(
            'questions').select_related(
            'week',
            'week__course',
            'week__course__user').filter(
            difficulty=difficulty,
            week__week_number=week_number,
            week__course__title_slug=title_slug,
            week__course__user=user)

        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        user = self.request.user
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']
        queryset = Quiz.objects.select_related('week',
                                               'week__course',
                                               'week__course__user').filter(
            week__week_number=week_number,
            week__course__title_slug=title_slug,
            week__course__user=user
        )
        return queryset

    @action(detail=False, methods=['post'], url_path='create_quizzes')
    def create_quizzes(self, request, *args, **kwargs):
        user = request.user
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']

        # Get week with related data
        queryset = Week.objects.select_related('course', 'course__user').filter(
            course__title_slug=title_slug,
            week_number=week_number
        )
        week = get_object_or_404(queryset)

        if week.course.user != user:
            return Response({'detail': 'Not allowed to add Quizzes to this course.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                quizzes = []
                for difficulty in ['N', 'M', 'S', 'I', 'A']:
                    data = {
                        'week': week.pk,
                        'difficulty': difficulty,
                        'passing_requirement': difficulty
                    }
                    serializer = self.get_serializer(data=data)
                    serializer.is_valid(raise_exception=True)
                    quiz = serializer.save()

                    questions = self.get_questions(
                        week=week, difficulty=difficulty)

                    if questions:
                        quiz.questions.set(questions)

                    quizzes.append(quiz)

                return Response({
                    'message': f'Successfully created {len(quizzes)} quizzes',
                    'quizzes': [{'id': q.id, 'difficulty': q.difficulty} for q in quizzes]
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                week = instance.week  # Get the week object from the instance
                difficulty = self.kwargs[self.lookup_field]

                # Get new questions
                new_questions = self.get_questions(
                    week=week, difficulty=difficulty)

                # Update the quiz
                instance.questions.set(new_questions)

                # Serialize the updated instance
                serializer = self.get_serializer(instance)

                return Response({
                    'message': 'Quiz updated successfully',
                    'quiz': serializer.data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Failed to update quiz: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], url_path='set_user_score')
    def set_user_score(self, request, *args, **kwargs):
        try:
            new_score = request.data.get('user_score')
            if new_score is None:
                return Response({'error': 'user_score is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                new_score = float(new_score)
                if not 0 <= new_score <= 100:
                    return Response({'error': 'Score must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({'error': 'Invalid score format'}, status=status.HTTP_400_BAD_REQUEST)

            instance = self.get_object()
            instance.user_score = new_score
            instance.save()

            return Response({
                'message': 'Score updated successfully',
                'new_score': new_score
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='evaluate_open_questions')
    def evaluate_open_questions(self, request, *args, **kwargs):
        items = request.data
        if not isinstance(items, list):
            return Response({
                'error': 'Request body must be an array'
            }, status=status.HTTP_400_BAD_REQUEST)

        def process_item(item):
            id = item['id']
            user_answer = item['user_answer']
            answer = item['answer']
            result = {'id': id}
            result.update(compare_open_answers(answer, user_answer))
            return result

        # Calculate optimal number of workers
        cpu_count = os.cpu_count() or 4  # fallback to 4 if cpu_count returns None
        max_workers = min(32, (2 * cpu_count) + 1)  # cap at 32 to prevent resource exhaustion

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = list(executor.map(process_item, items))

        return Response(results, status=status.HTTP_200_OK)

# ====================#


# Code section
# ====================#
class CodeViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CodeSerializer

    def get_queryset(self):
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']
        course = get_object_or_404(Course.objects.all(), title_slug=title_slug)
        week = get_object_or_404(
            Week.objects.all(), course=course, week_number=week_number)
        return Code.objects.filter(week=week)  # Return all codes for the week

    def create(self, request, *args, **kwargs):
        user = request.user
        queryset = Course.objects.all()
        title_slug = self.kwargs['title_slug']
        week_number = self.kwargs['week_number']
        course = get_object_or_404(queryset, title_slug=title_slug)

        if course.user != user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

        # get the correct week
        queryset = Week.objects.all()
        week = get_object_or_404(
            queryset, course=course, week_number=week_number)

        # Generate all coding problems for the week
        try:
            result = generate_coding_problems_for_week(week=week)
            return Response({
                'detail': 'Coding problems generated successfully',
                'generation_stats': result
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# ====================#

# class CodeCheckView(APIView):
#     def post(self, request, title, selectedWeek):
#         code_id = request.data.get('code_id')
#         solution = request.data.get('solution')

#         if not code_id or not solution:
#             return Response(
#                 {"error": "code_id and solution are required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Get the code and verify it belongs to the correct week/course
#         code = get_object_or_404(
#             Code.objects.select_related('week__course'),
#             id=code_id,
#             week__course__title=title,
#             week__week_number=selectedWeek
#         )

#         comparison = compare_answers(
#             question_type="coding",
#             correct_answer=code.solution,
#             user_answer=solution
#         )
#         user_score = comparison['user_score']
#         error = comparison['error']

#         code.user_score = user_score
#         code.template_code = solution
#         code.save(update_fields=['user_score', 'template_code'])

#         return Response({
#             "user_score": user_score,
#             "error": error
#         })
