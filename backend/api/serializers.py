from rest_framework import serializers
from .models import Course, Week, Question, Material, User
from django.contrib.auth.hashers import make_password, check_password


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'description',
                  'material', 'summarized_material']


class WeekSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ['week_number', 'materials']


class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'duration_weeks', 'weeks']



class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not check_password(value, user.password):
            raise serializers.ValidationError("Current password is incorrect")
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password',
                  'first_name', 'last_name', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Hash password if it's in the validated data
        if 'password' in validated_data:
            validated_data['password'] = make_password(
                validated_data['password'])

        # Update all fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance




class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class OnlyCourseSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Course
        fields = ['title', 'duration_weeks', 'description', 'user',
                  'image']
