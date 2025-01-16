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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="Student")
    image = CloudinaryField('image', null=True, blank=True)
    department = models.ForeignKey("Department", on_delete=models.SET_NULL, null=True)  # Khoa
    class_name = models.ForeignKey("Class", on_delete=models.SET_NULL, null=True)  # Lớp học
    active = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

# Khoa
class Department(models.Model):
    name = models.CharField(max_length=255, unique=True, null=False)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    

# Lớp học
class Class(models.Model):
    name = models.CharField(max_length=255)  # Tên lớp
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='classes')  # Khoa

    def __str__(self):
        return self.name


# Điểm rèn luyện 
class TrainingScore(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Student'})
    term = models.CharField(max_length=20)
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
    

# Bảng tin
class Newsfeed(models.Model):
    activity = models.OneToOneField(Activity, on_delete=models.CASCADE, related_name='newsfeed')
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_newsfeeds', blank=True)
    comments = models.ManyToManyField('Comment', related_name='newsfeed_comments', blank=True)

    def __str__(self):
        return f"Newsfeed: {self.activity.title}"


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
    

# Điểm danh
class Attendance(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Student'})
    attended = models.BooleanField(default=False)  # Trạng thái đã tham gia hay chưa

    def __str__(self):
        return f"{self.student.username} - {self.activity.title} ({'Đã tham gia' if self.attended else 'Chưa tham gia'})"
