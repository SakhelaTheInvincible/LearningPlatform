from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

class HelloAPIView(APIView):
    def get(self, request):
        return Response({"message": "Hello from Django API!"})