from rest_framework import serializers
from .models import Course, Week, Question

class WeekSerializer(serializers.ModelSerializer):
    class Meta:
        model = Week
        fields = ['week_number', 'material']

class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'duration_weeks', 'weeks']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'