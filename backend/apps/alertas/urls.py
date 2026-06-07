from django.urls import path
from .views import AlertasListCreate, AlertasDetail, AlertaCompletarView

urlpatterns = [
    path('', AlertasListCreate.as_view(), name='alertas-list'),
    path('<int:pk>/', AlertasDetail.as_view(), name='alertas-detail'),
    path('<int:pk>/completar/', AlertaCompletarView.as_view(), name='alerta-completar'),
]
