from django.urls import path
from .views import (generate_all_questions, 
                    get_week_view, course_view, create_weeks_view, OnlyCourseListAPIView, UserCreateAPIView,
                    UserRetrieveUpdateDestroyAPIView, UserListAPIView, PasswordChangeView)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    
    #path('course/<int:course_id>/', course_view, name='courses-create'),
    path('courses/', OnlyCourseListAPIView.as_view(), name='courses-create'),
    path('users/list/', UserListAPIView.as_view(), name='user-details'),
    path('users/me/',
         UserRetrieveUpdateDestroyAPIView.as_view(), name='user-detail'),
    path('users/set_password/', PasswordChangeView.as_view(), name='set-password'),

    path('signup', UserCreateAPIView.as_view(), name='user-creation'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('signup/',UserCreateAPIView.as_view(),name ='User-sign-up' ),
    path('course/<int:course_id>/create_weeks/', create_weeks_view, name='create-weeks'),
    ## courses/upload
    
    # Question endpoints
    path('course/<int:course_id>/questions/generate/',
         generate_all_questions, name='generate-all-questions'),
    path('course/<int:course_id>/week/<int:week_number>/',
         get_week_view, name='week-questions'),
]