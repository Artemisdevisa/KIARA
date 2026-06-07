from django.urls import path
from .views import CultivosListCreate, CultivosDetail, CultivosDataView

urlpatterns = [
    path('', CultivosListCreate.as_view(), name='cultivos-list'),
    path('<int:pk>/', CultivosDetail.as_view(), name='cultivos-detail'),
    path('data/recomendaciones/', CultivosDataView.as_view(), name='cultivos-data'),
]
