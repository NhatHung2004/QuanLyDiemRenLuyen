from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from .serializers import UserRegistrationSerializers, DepartmentSerializers
from .models import User, Department
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action


# Create your views here.
class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserRegistrationSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(username=serializer.validated_data['username']).exists():
                return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()
            return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DepartmentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializers
    