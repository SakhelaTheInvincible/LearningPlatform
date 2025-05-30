from rest_framework import serializers
from .models import Course, Week, Question, Material, User, Quiz, Code
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'description', 'summarized_material']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'difficulty',
                  'question_type', 'answer', 'explanation']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'difficulty', 'user_score', 'created_at', 'questions']


class CodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code
        fields = '__all__'


class WeekSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    codes = CodeSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ['week_number', 'materials', 'quizzes', 'is_completed']


class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['title', 'description', 'image',
                  'duration_weeks', 'weeks', 'language', 'is_completed']

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
        fields = '__all__'



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
                  'first_name', 'last_name', 'profile_picture']
    # def validate_username(self, value):
    #     if User.objects.exists(username=value):
    #         raise serializers.ValidationError("Username already exists!")

    # def validate_email(self, value):
    #     if User.objects.exists(email=value):
    #         raise serializers.ValidationError("Email already exists!")
    #     return value
# ====================#


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class OnlyCourseSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Course
        fields = ['id', 'title', 'duration_weeks', 'description', 'user',
                  'image', 'language', 'is_completed']
