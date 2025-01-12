# Generated by Django 5.1.3 on 2025-01-10 00:30

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('points', '0005_comment_interaction'),
    ]

    operations = [
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attended', models.BooleanField(default=False)),
                ('activity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='points.activity')),
                ('student', models.ForeignKey(limit_choices_to={'role': 'Student'}, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Class',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='classes', to='points.department')),
            ],
        ),
        migrations.AlterField(
            model_name='user',
            name='department',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='points.department'),
        ),
        migrations.CreateModel(
            name='Newsfeed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('activity', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='newsfeed', to='points.activity')),
                ('comments', models.ManyToManyField(blank=True, related_name='newsfeed_comments', to='points.comment')),
                ('likes', models.ManyToManyField(blank=True, related_name='liked_newsfeeds', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
