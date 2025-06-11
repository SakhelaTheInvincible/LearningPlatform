from django.urls import path, include
# from .views import (QuizAnswerCheckView, CodeCheckView, MaterialViewSet)


from api.views import (
    UserViewSet,
    UserSignUpViewSet,
    UserPublicViewSet,
    AdminUserViewSet,
    CourseViewSet,
    WeekViewSet,
    QuestionViewSet,
    QuizViewSet,
    MaterialViewSet,
    CodeViewSet
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
router.register(
    r'courses/(?P<title_slug>[\w-]+)/weeks/(?P<week_number>\d+)/questions', QuestionViewSet, basename='course-weeks-question')
router.register(
    r'courses/(?P<title_slug>[\w-]+)/weeks/(?P<week_number>\d+)/quizzes', QuizViewSet, basename='course-weeks-quiz')
router.register(
    r'courses/(?P<title_slug>[\w-]+)/weeks/(?P<week_number>\d+)/codes', CodeViewSet, basename='course-weeks-code')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
