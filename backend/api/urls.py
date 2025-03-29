from django.urls import path
from .views import HelloAPIView

urlpatterns = [
    path('hello/', HelloAPIView.as_view(), name='hello-api'),
]