from django.urls import path
from .views import (hello_api_view, generate_all_questions, 
get_week_view, course_view, create_weeks_view,OnlyCourseListAPIView,)

urlpatterns = [
    path('hello/', hello_api_view),
    
    # Course endpoints
    # POST /courses/ (create new course)
    path('courses/', OnlyCourseListAPIView.as_view(), name='courses-create'),

    
    # GET /courses/<id>/
#     path('courses/<int:course_id>/', course_view, name='course-detail'),
    
    # POST /courses/<id>/create_weeks/
    path('courses/<int:course_id>/create_weeks/', create_weeks_view, name='create-weeks'),
    ## courses/upload
    
    # Question endpoints
    path('courses/<int:course_id>/questions/generate/',
         generate_all_questions, name='generate-all-questions'),
    path('courses/<int:course_id>/weeks/<int:week_number>/',
         get_week_view, name='week-questions'),
]