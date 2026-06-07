from django.urls import path
from .views import PracticasListCreate, PracticaDetail, CostosListCreate, CostoDetail, ResumenCultivoView

urlpatterns = [
    path('practicas/', PracticasListCreate.as_view(), name='practicas-list'),
    path('practicas/<int:pk>/', PracticaDetail.as_view(), name='practica-detail'),
    path('costos/', CostosListCreate.as_view(), name='costos-list'),
    path('costos/<int:pk>/', CostoDetail.as_view(), name='costo-detail'),
    path('resumen/<int:cultivo_id>/', ResumenCultivoView.as_view(), name='resumen-cultivo'),
]
