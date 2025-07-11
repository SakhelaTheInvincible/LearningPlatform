from rest_framework import serializers
from .models import Course, Week, Question, Material, User, Quiz, Code
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.utils.text import slugify


# USER SECTION

# ====================#

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'profile_picture']


class AdminSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'first_name', 'last_name', "profile_picture"]
    #    fields = "__all__"


class UserSignUpSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name']

    # def validate_username(self, value):
    #     if User.objects.exists(username=value):
    #         raise serializers.ValidationError("Username already exists!")

    # def validate_email(self, value):
    #     if User.objects.exists(email=value):
    #         raise serializers.ValidationError("Email already exists!")
#        return value
    # def validate_password(self, value):
    #     try:
    #         validate_password(value)
    #     except Exception as e:
    #         raise serializers.ValidationError(str(e))
    #     return value

    def validate(self, attrs):
        if attrs['password_confirm'] != attrs['password']:
            raise serializers.ValidationError("Passwords don't match")
        attrs.pop('password_confirm')
        return attrs

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    # for general user specific retrieve/update/delete
    class Meta:
        model = User
        fields = ['username', 'email',
                  'first_name', 'last_name', 'profile_picture', 'user_exp']
    # def validate_username(self, value):
    #     if User.objects.exists(username=value):
    #         raise serializers.ValidationError("Username already exists!")

    # def validate_email(self, value):
    #     if User.objects.exists(email=value):
    #         raise serializers.ValidationError("Email already exists!")
    #     return value
# ====================#


# Material Section
# ====================#
class MaterialRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title']


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'description', 'summarized_material']


class MaterialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'description']

# ====================#

# Questions Section
# ====================#


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'difficulty',
                  'question_type', 'answer', 'explanation']


class QuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'week',
            'difficulty',
            'question_type',
            'question_text',
            'answer',
            'explanation',
        ]

# ====================#

# Quiz Section
# ====================#

class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['week', 'difficulty', 'passing_requirement']


class QuizListSerializer(serializers.ModelSerializer):
    difficulty_display = serializers.SerializerMethodField()
    passing_requirement_display = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'difficulty', 'difficulty_display',
                  'passing_requirement_display', 'user_score']

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()

    def get_passing_requirement_display(self, obj):
        return obj.get_passing_requirement_display()

class QuizSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    difficulty_display = serializers.SerializerMethodField()
    passing_requirement_display = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'difficulty', 'difficulty_display', 'passing_requirement',
                  'passing_requirement_display', 'user_score', 'questions']

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()

    def get_passing_requirement_display(self, obj):
        return obj.get_passing_requirement_display()
        
    def get_questions(self, obj):
        questions = obj.get_questions()
        return QuestionSerializer(questions, many=True).data


# ====================#
class CodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code
        fields = [
            'difficulty',
            'problem_statement',
            'solution',
            'template_code',
            'user_code'
        ]


class CodeListSerializer(serializers.ModelSerializer):
    difficulty_display = serializers.SerializerMethodField()

    class Meta:
        model = Code
        fields = [
            'id',
            'difficulty_display',
            'problem_statement',
            'solution',
            'template_code',
            'user_code',
            'user_score',
        ]

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()

class CodeSerializer(serializers.ModelSerializer):
    difficulty_display = serializers.SerializerMethodField()
    class Meta:
        model = Code
        fields = [
            'id',
            'difficulty_display',
            'problem_statement',
            'solution',
            'template_code',
            'user_code',
            'user_score'
        ]

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()



# Week Section
# ====================#
class WeekSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    # quizzes = QuizSerializer(many=True, read_only=True)
    # codes = CodeSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        # fields = ['week_number', 'materials', 'quizzes', 'is_completed']
        fields = ['week_number', 'materials', 'is_completed', 'updated_at', 'created_at']


class WeekRetrieveSerializer(serializers.ModelSerializer):
    materials = MaterialRetrieveSerializer(many=True, read_only=True)
    # quizzes = QuizSerializer(many=True, read_only=True)
    # codes = CodeSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ['week_number', 'materials', 'is_completed', 'updated_at', 'created_at']


class WeekCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Week
        fields = ['week_number']  # 'course' will be set in the view

# ====================#


# Course Section
# ====================#
class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['title', 'description', 'image',
                  'duration_weeks', 'weeks', 'language', 'is_completed', 'created_at']


class CourseRetrieveSerializer(serializers.ModelSerializer):
    weeks = WeekRetrieveSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['title', 'description', 'image',
                  'duration_weeks', 'weeks', 'language', 'is_completed', 'created_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    title_slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Course
        fields = ['title', 'title_slug', 'duration_weeks',
                  'description', 'user', 'image', 'language']


class CourseListSerializer(serializers.ModelSerializer):
    title_slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'title_slug', 'duration_weeks', 'description',
                  'image', 'is_completed', 'difficulty']




class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
