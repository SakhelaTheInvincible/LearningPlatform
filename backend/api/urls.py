from django.urls import path, include
from .views import (OnlyCourseCreateAPIView, MaterialQuizCreateAPIView,
                    WeekRetrieveAPIView, QuizAnswerCheckView, CodeCheckView, MaterialViewSet)


from api.views import (
    UserViewSet,
    UserSignUpViewSet,
    UserPublicViewSet,
    AdminUserViewSet,
    CourseViewSet,
    WeekViewSet
)
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'public-users', UserPublicViewSet, basename='public-user')
router.register(r'users', UserViewSet, basename='user')
router.register(r'signup', UserSignUpViewSet, basename='signup')
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

router.register(r'courses', CourseViewSet, basename='course')
router.register(
    r'courses/(?P<title_slug>[\w-]+)/weeks', WeekViewSet, basename='course-weeks')
router.register(
    r'courses/(?P<title_slug>[\w-]+)/weeks/(?P<week_number>\d+)/materials', MaterialViewSet, basename='course-weeks-material')

# add pagination to admin panel
urlpatterns = [
    path('', include(router.urls)),

    path('courses/<str:title>/week/<int:selectedWeek>/', WeekRetrieveAPIView.as_view(),
         name='courses-create'),
    
    path('courses/<str:title>/week/<int:selectedWeek>/quiz/check/', QuizAnswerCheckView.as_view(),
         name='quiz-check'),
    
    path('courses/<str:title>/week/<int:selectedWeek>/code/check/', CodeCheckView.as_view(),
         name='code-check'),

    #     path('courses/', OnlyCourseListAPIView.as_view(), name='courses-list'),
    path('course/upload/', OnlyCourseCreateAPIView.as_view(), name='courses-create'),

    path('course/upload/<str:courseTitle>/week/<int:selectedWeek>/',
         MaterialQuizCreateAPIView.as_view(), name='material-upload'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
