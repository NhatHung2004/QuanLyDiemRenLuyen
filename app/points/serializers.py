from rest_framework.serializers import ModelSerializer, ValidationError
from .models import Department, User, TrainingScore, Activity, MissingActivityReport, Comment
from rest_framework import serializers


class UserRegistrationSerializers(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'department', 'role', 'image']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False},
        }

    def validate_role(self, value):
        if not value or value.strip() == '':
            return 'Student'
        if value not in ['Assistant', 'Student']:
            raise ValidationError("Invalid role.")
        return value
    
    def validate_department(self, value):
        if not value:
            return None
        if not Department.objects.filter(id=value).exists():
            raise ValidationError("Department does not exist.")
        return value

    def validate_email(self, value):
        if not value.endswith('@ou.edu.vn'):
            raise ValidationError("Email must be a valid school-provided email address.")
        if User.objects.filter(email=value).exists():
            raise ValidationError("Email is already in use.")
        return value
    
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'Student'),
            department=validated_data.get('department', None),
            is_staff=validated_data.get('role', 'Student') == 'Assistant',
            image=validated_data.get('image', None),
        )
        user.set_password(validated_data['password'])
        
        user.save()
        return user
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:  # Nếu image tồn tại
            representation['image'] = instance.image.url  # Trả về URL thay vì đường dẫn file
        else:
            representation['image'] = None  # Nếu không có image, trả về None
        return representation
    

class DepartmentSerializers(ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class TrainingScoreSerializers(ModelSerializer):
    class Meta:
        model = TrainingScore
        fields = '__all__'


class ActivitySerializers(ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'start_date', 'end_date']


class RegisterActivitySerializer(serializers.Serializer):
    activity_id = serializers.IntegerField()
    student_id = serializers.IntegerField()


class MissingActivityReportSerializer(ModelSerializer):
    class Meta:
        model = MissingActivityReport
        fields = '__all__'


class StudentReportSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    evidence = serializers.CharField(max_length=255)


class CommentSerializer(ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
    