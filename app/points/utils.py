from io import StringIO, BytesIO
import csv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os
from django.conf import settings
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# Hàm xuất CSV
def export_training_scores_csv(queryset):
    output = StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerow(['Student ID', 'Name', 'Department', 'Class', 'Term', 'Total Score', 'Classification'])

    output.write(u'\ufeff')  # BOM (optional...Excel needs it to open UTF-8 file properly)

    for ts in queryset:
        writer.writerow([
            ts.student.id,
            ts.student.username,
            ts.student.department.name if ts.student.department else '',
            ts.student.class_name.name if ts.student.class_name else '',
            ts.term,
            ts.total_score,
            ts.classification,
        ])
    output.seek(0)
    return output.getvalue()

# Hàm xuất PDF
def export_training_scores_pdf(queryset):
    font_path = os.path.join(settings.STATIC_ROOT, "fonts/DejaVuSans.ttf")
    pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("DejaVuSans", 12)
    y = 750
    x = 30
    line_height = 14  # Chiều cao của mỗi dòng

    p.drawString(x, y, "Training Score Statistics")
    y -= line_height

    max_width = letter[0] - 60  # Kích thước tối đa cho mỗi dòng (chiều rộng của trang trừ khoảng cách 2 bên)

    def wrap_text(text, max_width, font_name="DejaVuSans", font_size=12):
        """Chia văn bản thành nhiều dòng nếu cần thiết"""
        text_lines = []
        current_line = ""
        p.setFont(font_name, font_size)
        
        for word in text.split(' '):
            test_line = f"{current_line} {word}".strip()
            width = p.stringWidth(test_line)
            if width <= max_width:
                current_line = test_line
            else:
                if current_line:
                    text_lines.append(current_line)
                current_line = word

        if current_line:
            text_lines.append(current_line)
        
        return text_lines

    # In từng dòng điểm
    for ts in queryset:
        text = (
            f"{ts.student.department.name if ts.student.department else ''} - "
            f"{ts.student.class_name.name if ts.student.class_name else ''} - "
            f"Học kỳ: {ts.term} - Điểm: {ts.total_score} - Xếp loại: {ts.classification}"
        )
        
        # Chia văn bản thành nhiều dòng nếu quá dài
        text_lines = wrap_text(text, max_width)
        
        for line in text_lines:
            p.drawString(x, y, line)
            y -= line_height
            if y < 50:  # Nếu hết trang, tạo trang mới
                p.showPage()
                p.setFont("DejaVuSans", 12)
                y = 750
        
    p.save()
    buffer.seek(0)
    return buffer.getvalue()
