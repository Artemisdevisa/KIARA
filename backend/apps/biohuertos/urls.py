from django.urls import path
from .views import BiohuertosListCreate, BiohuertosDetail, DocumentosListCreate, DocumentoDetail

urlpatterns = [
    path('', BiohuertosListCreate.as_view(), name='biohuertos-list'),
    path('<int:pk>/', BiohuertosDetail.as_view(), name='biohuertos-detail'),
    path('<int:biohuerto_pk>/documentos/', DocumentosListCreate.as_view(), name='documentos-list'),
    path('documentos/<int:pk>/', DocumentoDetail.as_view(), name='documento-detail'),
]
