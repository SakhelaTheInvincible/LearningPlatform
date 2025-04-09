from django.urls import path
from .views import hello_api_view
from .views import questions_view

urlpatterns = [
    path('hello/', hello_api_view),
    path('questions/', questions_view),
]