from django.urls import path
from .views import (hello_api_view, generate_all_questions, 
get_week_view, course_view, create_weeks_view,OnlyCourseListAPIView,UserCreateAPIView,UserRetrieveUpdateDestroyAPIView,UserListAPIView)

urlpatterns = [
    path('hello/', hello_api_view),
    

    path('courses/', OnlyCourseListAPIView.as_view(), name='courses-create'),
    path('users/list/', UserListAPIView.as_view(), name='user-details'),
    path('users/<str:username>/', UserRetrieveUpdateDestroyAPIView.as_view(), name='user-details'),
   

    path('signup/',UserCreateAPIView.as_view(),name ='User-sign-up' ),
    path('courses/<int:course_id>/create_weeks/', create_weeks_view, name='create-weeks'),
    ## courses/upload
    
    # Question endpoints
    path('courses/<int:course_id>/questions/generate/',
         generate_all_questions, name='generate-all-questions'),
    path('courses/<int:course_id>/weeks/<int:week_number>/',
         get_week_view, name='week-questions'),
]