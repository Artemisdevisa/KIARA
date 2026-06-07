from django.urls import path
from .views import DiagnosticosListCreate, DiagnosticoDetail, DiagnosticoAnalizarView, DiagnosticosBaseView

urlpatterns = [
    path('', DiagnosticosListCreate.as_view(), name='diagnosticos-list'),
    path('<int:pk>/', DiagnosticoDetail.as_view(), name='diagnostico-detail'),
    path('analizar/', DiagnosticoAnalizarView.as_view(), name='diagnostico-analizar'),
    path('base/', DiagnosticosBaseView.as_view(), name='diagnosticos-base'),
]
