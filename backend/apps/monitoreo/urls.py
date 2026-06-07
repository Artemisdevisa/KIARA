from django.urls import path
from .views import MonitoreoListCreate, MonitoreoDetail

urlpatterns = [
    path('', MonitoreoListCreate.as_view(), name='monitoreo-list'),
    path('<int:pk>/', MonitoreoDetail.as_view(), name='monitoreo-detail'),
]
