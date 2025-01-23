from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from .serializers import UserRegistrationSerializers, DepartmentSerializers,TrainingScoreSerializers, ActivitySerializers, RegisterActivitySerializer, StudentReportSerializer, MissingActivityReportSerializer, CommentSerializer, UpdateTrainingScoreSerializer
from .models import User, Department, TrainingScore, Activity, MissingActivityReport, Comment
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from django.db.models import Avg, Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .utils import export_training_scores_csv, export_training_scores_pdf
from django.http import HttpResponse
from django.utils.timezone import now
from oauth2_provider.views import TokenView
import json
from rest_framework.renderers import JSONRenderer


class CustomTokenView(TokenView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # Chuyển đổi HttpResponse thành JSON
        try:
            data = json.loads(response.content)
        except json.JSONDecodeError:
            return Response({"error": "Invalid server response"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Nếu response trả về lỗi, trả về lỗi đó
        if response.status_code != 200:
            return Response(data, status=response.status_code)

        if request.content_type == "application/json":
            body = json.loads(request.body)
            username = body.get("username")
        else:
            username = request.POST.get("username")
            
        user = User.objects.filter(username=username).first()
        print(username)

        user_data = {}
        if user:
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "image": user.image.url if user.image else None,
            }
        
        # Ghi đè hoặc bổ sung dữ liệu vào response
        custom_data = {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "expires_in": data.get("expires_in"),
            "scope": data.get("scope"),
            "token_type": data.get("token_type"),
            # Bổ sung thông tin tùy chỉnh
            "user": user_data,
        }

        custom_response = Response(custom_data, status=status.HTTP_200_OK)
        custom_response.accepted_renderer = JSONRenderer()
        custom_response.accepted_media_type = "application/json"
        custom_response.renderer_context = {}

        return custom_response


# Create your views here.
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    """
        API quản lý người dùng.
    """

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserRegistrationSerializers
    parser_classes = [MultiPartParser, ]

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
    
    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsAuthenticated()]
        return [AllowAny()]
    

class ScoreViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    """
        API trả về danh sách điểm rèn luyện của từng sinh viên.
    """

    queryset = TrainingScore.objects.all()
    serializer_class = TrainingScoreSerializers
    # permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Xem điểm rèn luyện của 1 sinh viên",
        manual_parameters=[
            openapi.Parameter('student_id', openapi.IN_QUERY, description="ID sinh viên", type=openapi.TYPE_INTEGER),
        ]
    )
    @action(detail=False, methods=['get'])
    def student_score(self, request):
        student_id = request.query_params.get('student_id')
        try:
            score = TrainingScore.objects.filter(student_id=student_id).first()
            return Response({"data": self.serializer_class(score).data}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Sinh viên không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Thống kê điểm rèn luyện",
        manual_parameters=[
            openapi.Parameter('department', openapi.IN_QUERY, description="ID khoa", type=openapi.TYPE_INTEGER),
            openapi.Parameter('class', openapi.IN_QUERY, description="ID lớp học", type=openapi.TYPE_INTEGER),
            openapi.Parameter('term', openapi.IN_QUERY, description="Kỳ học", type=openapi.TYPE_STRING),
            openapi.Parameter('classification', openapi.IN_QUERY, description="Xếp loại (Xuất sắc, Giỏi,...)", type=openapi.TYPE_STRING),
        ]
    )
    @action(detail=False, methods=['get'])
    def stats_score(self, request):
        queryset = TrainingScore.objects.all()

        # Lấy tham số lọc
        department_id = request.query_params.get('department')
        class_id = request.query_params.get('class')
        term = request.query_params.get('term')
        classification = request.query_params.get('classification')
        
        # Lọc theo khoa, lớp, kỳ học, và xếp loại
        if department_id:
            queryset = queryset.filter(student__department_id=department_id)
        if class_id:
            queryset = queryset.filter(student__class_name_id=class_id)
        if term:
            queryset = queryset.filter(term__icontains=term)
        if classification:
            queryset = queryset.filter(classification=classification)

        # Tính toán trung bình và phân bố xếp loại
        avg_score = queryset.aggregate(Avg('total_score'))['total_score__avg'] or 0
        classification_count = queryset.values('classification').annotate(count=Count('id'))

        # Chuẩn bị dữ liệu trả về
        data = {
            "total_students": queryset.count(),
            "average_score": round(avg_score, 2),
            "classification_distribution": {
                cls['classification']: cls['count'] for cls in classification_count
            },
            "details": [
                {
                    "student_id": ts.student.id,
                    "name": ts.student.username,
                    "term": ts.term,
                    "total_score": ts.total_score,
                    "classification": ts.classification,
                }
                for ts in queryset
            ],
        }
        return Response(data)
    
    @swagger_auto_schema(
        operation_description="Xuất dữ liệu điểm rèn luyện (CSV hoặc PDF)",
        manual_parameters=[
            openapi.Parameter('export_type', openapi.IN_QUERY, description="Định dạng file (csv hoặc pdf)", type=openapi.TYPE_STRING, default="csv"),
            openapi.Parameter('department', openapi.IN_QUERY, description="ID khoa", type=openapi.TYPE_INTEGER),
            openapi.Parameter('class', openapi.IN_QUERY, description="ID lớp học", type=openapi.TYPE_INTEGER),
            openapi.Parameter('term', openapi.IN_QUERY, description="Kỳ học", type=openapi.TYPE_STRING),
        ]
    )
    @action(detail=False, methods=['get'])
    def export_file(self, request, format=None):
        format_type = request.query_params.get('export_type')
        department_id = request.query_params.get('department')
        class_id = request.query_params.get('class')
        term = request.query_params.get('term')

        # Lọc dữ liệu
        queryset = TrainingScore.objects.all()
        if department_id:
            queryset = queryset.filter(student__department_id=department_id)
        if class_id:
            queryset = queryset.filter(student__class_name_id=class_id)
        if term:
            queryset = queryset.filter(term__icontains=term)

        # Xuất dữ liệu theo định dạng
        if format_type == 'pdf':
            pdf_data = export_training_scores_pdf(queryset)
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="training_scores.pdf"'
            return response
        else:  # Mặc định xuất CSV
            csv_data = export_training_scores_csv(queryset)
            response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = 'attachment; filename="training_scores.csv"'
            return response
        
    @action(detail=False, methods=['patch'], serializer_class=UpdateTrainingScoreSerializer)
    def update_score(self, request):
        """
        API cập nhật điểm rèn luyện của sinh viên.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data['student_id']
        term = serializer.validated_data['term']

        try:
            score = TrainingScore.objects.get(student_id=student_id, term=term)
        except TrainingScore.DoesNotExist:
            return Response({"detail": "Điểm rèn luyện không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        serializer.update(score, serializer.validated_data)

        return Response({"detail": "Cập nhật điểm rèn luyện thành công.", "data": serializer.data}, status=status.HTTP_200_OK)
    

class DepartmentViewSet(viewsets.ViewSet, generics.ListAPIView):
    """
        API trả về danh sách khoa.
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializers
    permission_classes = [IsAuthenticated]


class ActivitiesViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    """
        API quản lý hoạt động ngoại khoá.
    """

    queryset = Activity.objects.all()
    serializer_class = ActivitySerializers
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], serializer_class=RegisterActivitySerializer)
    def register(self, request):
        """
        API đăng ký sinh viên vào hoạt động.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) 

        # Lấy dữ liệu từ request
        activity_id = serializer.validated_data['activity_id']
        student_id = serializer.validated_data['student_id']

        # Kiểm tra xem cả hai tham số có được gửi lên không
        if not activity_id or not student_id:
            return Response({"detail": "Vui lòng cung cấp activity_id và student_id."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Lấy sinh viên từ student_id
            student = User.objects.get(id=student_id, role='Student')
        except User.DoesNotExist:
            return Response({"detail": "Sinh viên không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Lấy hoạt động từ activity_id
            activity = Activity.objects.get(id=activity_id)
        except Activity.DoesNotExist:
            return Response({"detail": "Hoạt động không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra xem hoạt động có đang mở đăng ký không
        if activity.start_date <= now():
            return Response({"detail": "Hoạt động đã bắt đầu hoặc kết thúc, không thể đăng ký."}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem sinh viên đã đăng ký chưa
        if student in activity.participants.all():
            return Response({"detail": "Sinh viên đã đăng ký hoạt động này rồi."}, status=status.HTTP_400_BAD_REQUEST)

        # Đăng ký sinh viên vào hoạt động
        activity.participants.add(student)
        activity.save()

        return Response({"detail": "Đăng ký thành công hoạt động."}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def participated(self, request):
        """
        API trả về danh sách các hoạt động mà sinh viên đã tham gia.
        """
        user = request.user

        # Kiểm tra người dùng có phải sinh viên không
        if user.role != 'Student':
            return Response({"detail": "Chỉ sinh viên mới có thể sử dụng API này."}, status=status.HTTP_403_FORBIDDEN)

        # Lấy danh sách các hoạt động mà sinh viên đã tham gia
        activities = user.activities.all()

        # Sử dụng serializer để trả về danh sách
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], serializer_class=StudentReportSerializer)
    def report_missing(self, request, pk=None):
        """
        API báo thiếu hoạt động (nếu sinh viên đã tham gia nhưng chưa được ghi nhận).
        """
        serialized = self.get_serializer(data=request.data)
        serialized.is_valid(raise_exception=True)

        # Lấy thông tin từ request
        student_id = serialized.validated_data['student_id']
        evidence = serialized.validated_data['evidence']

        # Kiểm tra dữ liệu đầu vào
        if not student_id or not evidence:
            return Response(
                {"detail": "Vui lòng cung cấp student_id và minh chứng (evidence)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra sinh viên tồn tại
        try:
            student = User.objects.get(id=student_id, role='Student')
        except User.DoesNotExist:
            return Response({"detail": "Sinh viên không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra hoạt động tồn tại
        try:
            activity = Activity.objects.get(id=pk)
        except Activity.DoesNotExist:
            return Response({"detail": "Hoạt động không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra sinh viên có tham gia hoạt động không
        if not activity.participants.filter(id=student.id).exists():
            return Response(
                {"detail": "Sinh viên chưa tham gia hoạt động này."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tạo báo cáo thiếu
        report, created = MissingActivityReport.objects.get_or_create(
            student=student,
            activity=activity,
            defaults={"evidence": evidence}
        )

        if not created:
            return Response(
                {"detail": "Sinh viên đã báo thiếu hoạt động này trước đó."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"detail": "Báo thiếu hoạt động thành công. Báo cáo đang chờ duyệt."},
            status=status.HTTP_201_CREATED
        )
    
    @action(methods=['get', 'post'], url_path='comments', detail=True, serializer_class=CommentSerializer)
    def get_comments(self, request, pk):
        """
        API quản lý bình luận của hoạt động.
        """
        if request.method.__eq__('POST'):
            content = request.data.get('content')
            c = Comment.objects.create(content=content, user=request.user, activity=self.get_object())

            return Response(CommentSerializer(c).data)
        else:
            comments = self.get_object().comments.select_related('user').all()

            return Response(CommentSerializer(comments, many=True).data)
    

class MissingActivityReportViewSet(viewsets.ViewSet, generics.ListAPIView, generics.DestroyAPIView):
    """
        API danh sách các hoạt động sinh viên báo thiếu,
    """

    queryset = MissingActivityReport.objects.filter(is_approved=False)
    serializer_class = MissingActivityReportSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def approve(self, request, pk=None):
        """
        API xác nhận báo cáo thiếu hoạt động.
        """
        try:
            report = MissingActivityReport.objects.get(id=pk)
        except MissingActivityReport.DoesNotExist:
            return Response({"detail": "Báo cáo không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        report.is_approved = True
        report.save()

        return Response({"detail": "Báo cáo đã được xác nhận."}, status=status.HTTP_200_OK)
    