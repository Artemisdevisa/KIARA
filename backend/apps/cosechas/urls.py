from django.urls import path
from .views import (
    CosechasListCreate, CosechaDetail, CosechaAgotarView,
    CosechaVenderView, CosechasPublicasView, CategoriasPublicasView,
    CosechaPublicaDetailView,
)

urlpatterns = [
    path('', CosechasListCreate.as_view(), name='cosechas-list'),
    path('<int:pk>/', CosechaDetail.as_view(), name='cosecha-detail'),
    path('<int:pk>/agotar/', CosechaAgotarView.as_view(), name='cosecha-agotar'),
    path('<int:pk>/vender/', CosechaVenderView.as_view(), name='cosecha-vender'),
    path('publicas/', CosechasPublicasView.as_view(), name='cosechas-publicas'),
    path('publicas/<int:pk>/', CosechaPublicaDetailView.as_view(), name='cosecha-publica-detail'),
    path('categorias/', CategoriasPublicasView.as_view(), name='categorias-publicas'),
]
