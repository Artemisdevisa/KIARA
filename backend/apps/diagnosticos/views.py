import json
from pathlib import Path
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Diagnostico
from .serializers import DiagnosticoSerializer


def _cargar_base_diagnosticos():
    data_path = Path(__file__).resolve().parent.parent.parent / 'data' / 'diagnosticos_base.json'
    with open(data_path, encoding='utf-8') as f:
        return json.load(f)


def _analizar_sintomas(parte_afectada, sintomas_seleccionados):
    """Busca el problema que más coincide con la parte y síntomas dados."""
    base = _cargar_base_diagnosticos()
    mejor_match = None
    mejor_puntaje = 0

    for problema in base:
        if parte_afectada not in problema.get('partes', []):
            continue
        sintomas_problema = set(problema.get('sintomas_clave', []))
        sintomas_usuario = set(sintomas_seleccionados)
        coincidencias = len(sintomas_problema & sintomas_usuario)
        if coincidencias > mejor_puntaje:
            mejor_puntaje = coincidencias
            mejor_match = problema

    if mejor_match:
        return {
            'diagnostico_probable': mejor_match['nombre'],
            'causa_probable': mejor_match['causa'],
            'recomendacion': mejor_match['recomendacion'],
        }
    return {
        'diagnostico_probable': 'No determinado',
        'causa_probable': 'Los síntomas no coinciden con problemas registrados.',
        'recomendacion': 'Consulta con un técnico agroecológico.',
    }


class DiagnosticosListCreate(generics.ListCreateAPIView):
    serializer_class = DiagnosticoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Diagnostico.objects.filter(cultivo__biohuerto__productor=self.request.user)
        cultivo_id = self.request.query_params.get('cultivo')
        if cultivo_id:
            qs = qs.filter(cultivo_id=cultivo_id)
        return qs


class DiagnosticoDetail(generics.RetrieveDestroyAPIView):
    serializer_class = DiagnosticoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Diagnostico.objects.filter(cultivo__biohuerto__productor=self.request.user)


class DiagnosticoAnalizarView(APIView):
    """Devuelve el análisis sin guardar (paso 4 del wizard)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        parte = request.data.get('parte_afectada', '')
        sintomas = request.data.get('sintomas', [])
        if not parte or not sintomas:
            return Response({'detail': 'Parte afectada y síntomas son requeridos.'}, status=400)
        resultado = _analizar_sintomas(parte, sintomas)
        return Response(resultado)


class DiagnosticosBaseView(APIView):
    """Lista todos los problemas de la base de datos estática."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_cargar_base_diagnosticos())
