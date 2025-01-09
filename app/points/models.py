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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CHOICES[2][0])
    avatar = CloudinaryField(null=True)
    department = models.CharField(max_length=255, blank=True, null=True)  # Khoa
    active = models.BooleanField(default=False)  # Phê duyệt tài khoản (Sinh viên)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# Điểm rèn luyện 
class TrainingScore(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Student'})
    term = models.CharField(max_length=20)  # Học kỳ hoặc năm học
    scores = models.JSONField()  # Lưu điểm từng điều theo quy chế (dưới dạng JSON)
    total_score = models.IntegerField()  # Tổng điểm rèn luyện
    classification = models.CharField(max_length=50)  # Xếp loại: Xuất sắc, Giỏi, Khá, Trung Bình, Yếu, Kém

    def __str__(self):
        return f"{self.student.username} - {self.term} - {self.total_score} điểm"
    

# Hoạt động ngoại khoá
class Activity(models.Model):
    title = models.CharField(max_length=255)  # Tên hoạt động
    description = models.TextField(null=True, blank=True)  # Mô tả hoạt động
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Assistant'})
    department = models.CharField(max_length=255, blank=True, null=True)  # Khoa tổ chức
    start_date = models.DateTimeField()  # Ngày bắt đầu
    end_date = models.DateTimeField()  # Ngày kết thúc
    participants = models.ManyToManyField(User, related_name='activities', blank=True, limit_choices_to={'role': 'Student'})

    def __str__(self):
        return self.title
    

# Báo cáo thiếu hoạt động
class MissingActivityReport(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Student'})
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    evidence = models.TextField()  # Minh chứng
    is_approved = models.BooleanField(default=False)  # Xác nhận hoặc từ chối
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Báo thiếu: {self.student.username} - {self.activity.title}"


# Bình luận
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity.title}"


# Tương tác (Like/Unlike)
class Interaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='interactions')
    is_liked = models.BooleanField(default=False)  # True nếu là like

    def __str__(self):
        return f"{self.user.username} - {self.activity.title} - {'Like' if self.is_liked else 'Unlike'}"
