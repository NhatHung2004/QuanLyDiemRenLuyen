from django.contrib import admin
from .models import User, TrainingScore, Activity, MissingActivityReport, Comment, Interaction, Department, Class
from django.urls import path
from django.http import HttpResponse
import csv
from django.utils.safestring import mark_safe
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from io import BytesIO
import os
from django.conf import settings
from django.contrib.auth.admin import UserAdmin


font_path = os.path.join(settings.BASE_DIR, "points/static/fonts/Roboto-Regular.ttf")
pdfmetrics.registerFont(TTFont('Roboto', font_path))


class MyTrainingScoreAdmin(admin.ModelAdmin):
    list_display = ('student', 'term', 'total_score', 'classification')
    list_filter = ('student__department', 'classification')  # Lọc theo khoa, thành tích
    search_fields = ('student__username', 'student__email', 'term')

    actions = ['export_as_csv', 'export_as_pdf']

    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="training_scores.csv"'

        writer = csv.writer(response)
        writer.writerow(['Student', 'Term', 'Total Score', 'Classification'])

        for obj in queryset:
            writer.writerow([obj.student.username, obj.term, obj.total_score, obj.classification])

        return response
    export_as_csv.short_description = "Export selected records to CSV"
    
    def export_as_pdf(self, request, queryset):
        """
        Export selected training scores to PDF.
        """
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="training_scores.pdf"'

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        pdf.setFont("Roboto", 12)

        pdf.setFont("Helvetica", 12)
        pdf.drawString(100, 800, "Training Score Report")

        y = 750
        for obj in queryset:
            pdf.drawString(100, y, f"Student: {obj.student.username}, Term: {obj.term}, "
                                    f"Total Score: {obj.total_score}, Classification: {obj.classification}")
            y -= 20

        pdf.save()
        pdf_content = buffer.getvalue()
        buffer.close()
        response.write(pdf_content)
        return response
    export_as_pdf.short_description = "Export selected records to PDF"


class MyUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'department', 'class_name', 'is_active', 'is_staff')
    readonly_fields = ['avatar']
    list_filter = ('role', 'department', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'department__name')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'role', 'department', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'role', 'department', 'class_name', 'is_active', 'is_staff', 'image'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions',)

    def avatar(self, user):
        if user.image:
            return mark_safe(f"<img src='{user.image.url}' width='120' />")
        return 'No Image'


# Register your models here.
admin.site.register(User, MyUserAdmin)
admin.site.register(Department)
admin.site.register(TrainingScore, MyTrainingScoreAdmin)
admin.site.register(Activity)
admin.site.register(MissingActivityReport)
admin.site.register(Comment)
admin.site.register(Interaction)
admin.site.register(Class)
