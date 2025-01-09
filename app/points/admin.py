from django.contrib import admin
from .models import User, TrainingScore, Activity, MissingActivityReport, Comment, Interaction

# Register your models here.
admin.site.register(User)
admin.site.register(TrainingScore)
admin.site.register(Activity)
admin.site.register(MissingActivityReport)
admin.site.register(Comment)
admin.site.register(Interaction)
