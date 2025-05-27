from django.urls import path
from .views import (OnlyCourseListAPIView, UserCreateAPIView,
                    UserRetrieveUpdateDestroyAPIView, UserListAPIView,
                    PasswordChangeView, OnlyCourseCreateAPIView, MaterialQuizCreateAPIView, CourseRetrieveUpdateDestroyAPIView, 
                    WeekRetrieveAPIView, QuizAnswerCheckView, CodeCheckView)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [

    path('courses/<str:title>/', CourseRetrieveUpdateDestroyAPIView.as_view(),
         name='courses-create'),
    
    path('courses/<str:title>/week/<int:selectedWeek>/', WeekRetrieveAPIView.as_view(),
         name='courses-create'),
    
    path('courses/<str:title>/week/<int:selectedWeek>/quiz/check/', QuizAnswerCheckView.as_view(),
         name='quiz-check'),
    
    path('courses/<str:title>/week/<int:selectedWeek>/code/check/', CodeCheckView.as_view(),
         name='code-check'),
    
    path('users/list/', UserListAPIView.as_view(), name='user-details'),
    path('users/me/',
         UserRetrieveUpdateDestroyAPIView.as_view(), name='user-detail'),

    path('users/set_password/', PasswordChangeView.as_view(), name='set-password'),

    path('courses/', OnlyCourseListAPIView.as_view(), name='courses-list'),
    path('course/upload/', OnlyCourseCreateAPIView.as_view(), name='courses-create'),

    path('course/upload/<str:courseTitle>/week/<int:selectedWeek>/',
         MaterialQuizCreateAPIView.as_view(), name='material-upload'),

    path('signup/', UserCreateAPIView.as_view(), name='user-creation'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
