from django.urls import path
from .views import (
    BiohuertosListCreate, BiohuertosDetail,
    DocumentosListCreate, DocumentoDetail,
    MiembrosListCreate, MiembroDetail,
    AdminBiohuertosListView, UsuariosListView,
)

urlpatterns = [
    path('',                                   BiohuertosListCreate.as_view(),    name='biohuertos-list'),
    path('<int:pk>/',                          BiohuertosDetail.as_view(),        name='biohuertos-detail'),
    path('<int:biohuerto_pk>/documentos/',     DocumentosListCreate.as_view(),    name='documentos-list'),
    path('documentos/<int:pk>/',              DocumentoDetail.as_view(),         name='documento-detail'),
    path('<int:biohuerto_pk>/miembros/',       MiembrosListCreate.as_view(),      name='miembros-list'),
    path('miembros/<int:pk>/',                MiembroDetail.as_view(),           name='miembro-detail'),
    path('admin/todos/',                       AdminBiohuertosListView.as_view(), name='admin-biohuertos'),
    path('admin/usuarios/',                    UsuariosListView.as_view(),        name='admin-usuarios'),
]
