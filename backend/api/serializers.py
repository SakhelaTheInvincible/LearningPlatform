from rest_framework import serializers
from .models import Course, Week, Question, Material

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['name', 'description']  ## in future we also need to proved summerized material 






class WeekSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    class Meta:
        model = Week
        fields = ['week_number', 'materials']

class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True) 
    class Meta:
        model = Course
        fields = ['id', 'name', 'duration_weeks', 'weeks']

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
      