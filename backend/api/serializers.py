from rest_framework import serializers
from .models import Course, Week, Question, Material,User

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'description']  ## in future we also need to proved summerized material 

## signUp section


class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.ChoiceField(choices=[
        ('student', 'Student'),
        ('professor', 'Professor'),
    ])    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email','password','profile_picture','user_type']


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

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class OnlyCourseSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()
    def get_slug(self,obj):
        return obj.title.replace(' ','-')
    class  Meta:
        model = Course
        fields = ['id', 'title','slug','description','duration_weeks','level','estimated_time','image']
      