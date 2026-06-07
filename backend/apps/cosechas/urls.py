from django.urls import path
from .views import CosechasListCreate, CosechaDetail, CosechaAgotarView, CosechasPublicasView

urlpatterns = [
    path('', CosechasListCreate.as_view(), name='cosechas-list'),
    path('<int:pk>/', CosechaDetail.as_view(), name='cosecha-detail'),
    path('<int:pk>/agotar/', CosechaAgotarView.as_view(), name='cosecha-agotar'),
    path('publicas/', CosechasPublicasView.as_view(), name='cosechas-publicas'),
]
