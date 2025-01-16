from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register('users', views.UserViewSet, basename='users')
router.register('departments', views.DepartmentViewSet, basename='departments')
router.register('scores', views.StatsViewSet, basename='stats-score')
router.register('activities', views.ActivitiesViewSet, basename='activities')
router.register('missing_report', views.MissingActivityReportViewSet, basename='missing_report')


urlpatterns = [
    path('', include(router.urls)),
]
