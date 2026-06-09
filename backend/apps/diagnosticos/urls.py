from django.urls import path
from .views import (
    DiagnosticosListCreate, DiagnosticoDetail,
    DiagnosticoAnalizarView, DiagnosticosBaseView,
    DiagnosticoClaudeView,
)

urlpatterns = [
    path('', DiagnosticosListCreate.as_view(), name='diagnosticos-list'),
    path('<int:pk>/', DiagnosticoDetail.as_view(), name='diagnostico-detail'),
    path('analizar/', DiagnosticoAnalizarView.as_view(), name='diagnostico-analizar'),
    path('analizar-ia/', DiagnosticoClaudeView.as_view(), name='diagnostico-analizar-ia'),
    path('base/', DiagnosticosBaseView.as_view(), name='diagnosticos-base'),
]
