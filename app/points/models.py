from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = [
        ('CTSV', 'Chuyên Viên CTSV'),
        ('Assistant', 'Trợ Lý Sinh Viên'),
        ('Student', 'Sinh Viên'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    avatar = CloudinaryField(null=True)
    department = models.CharField(max_length=255, blank=True, null=True)  # Khoa
    active = models.BooleanField(default=False)  # Phê duyệt tài khoản (Sinh viên)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    
class TrainingScore(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Student'})
    term = models.CharField(max_length=20)  # Học kỳ hoặc năm học
    scores = models.JSONField()  # Lưu điểm từng điều theo quy chế (dưới dạng JSON)
    total_score = models.IntegerField()  # Tổng điểm rèn luyện
    classification = models.CharField(max_length=50)  # Xếp loại: Xuất sắc, Giỏi, Khá, Trung Bình, Yếu, Kém

    def __str__(self):
        return f"{self.student.username} - {self.term} - {self.total_score} điểm"