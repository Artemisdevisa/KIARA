from django.urls import path
from .views import BiohuertosListCreate, BiohuertosDetail

urlpatterns = [
    path('', BiohuertosListCreate.as_view(), name='biohuertos-list'),
    path('<int:pk>/', BiohuertosDetail.as_view(), name='biohuertos-detail'),
]
