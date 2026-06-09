import json
import re
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
    """Análisis estático de fallback: busca el mejor match en la base JSON."""
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
            'severidad': 'moderado',
            'acciones_preventivas': [],
        }
    return {
        'diagnostico_probable': 'No determinado',
        'causa_probable': 'Los síntomas no coinciden con problemas registrados.',
        'recomendacion': 'Consulta con un técnico agroecológico.',
        'severidad': 'moderado',
        'acciones_preventivas': [],
    }


def _parsear_respuesta_claude(texto):
    """Extrae el JSON de la respuesta de Claude."""
    match = re.search(r'\{.*\}', texto, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group())
        if isinstance(data.get('acciones_preventivas'), str):
            data['acciones_preventivas'] = [data['acciones_preventivas']]
        if not isinstance(data.get('acciones_preventivas'), list):
            data['acciones_preventivas'] = []
        if data.get('severidad') not in ('leve', 'moderado', 'grave'):
            data['severidad'] = 'moderado'
        return data
    except (json.JSONDecodeError, ValueError):
        return None


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
    """Análisis estático sin IA (fallback / compatibilidad)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        parte = request.data.get('parte_afectada', '')
        sintomas = request.data.get('sintomas', [])
        if not parte or not sintomas:
            return Response({'detail': 'Parte afectada y síntomas son requeridos.'}, status=400)
        resultado = _analizar_sintomas(parte, sintomas)
        return Response(resultado)


class DiagnosticoClaudeView(APIView):
    """Diagnóstico asistido por IA usando Claude (formulario e imagen)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            import anthropic
        except ImportError:
            # SDK no instalado — caer en análisis estático
            parte = request.data.get('parte_afectada', '')
            sintomas = request.data.get('sintomas', [])
            return Response(_analizar_sintomas(parte, sintomas))

        metodo = request.data.get('metodo', 'formulario')
        cultivo_nombre = request.data.get('cultivo_nombre', 'cultivo')

        try:
            client = anthropic.Anthropic()
        except Exception:
            return Response(
                {'detail': 'API key de Anthropic no configurada. Verifica ANTHROPIC_API_KEY.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        JSON_SCHEMA = '''{
  "diagnostico_probable": "nombre del problema",
  "causa_probable": "descripción breve de la causa",
  "recomendacion": "recomendación de manejo orgánico adaptada a Lambayeque",
  "severidad": "leve|moderado|grave",
  "acciones_preventivas": ["acción 1", "acción 2", "acción 3"]
}'''

        try:
            if metodo == 'imagen':
                imagen_b64 = request.data.get('imagen', '')
                media_type = request.data.get('media_type', 'image/jpeg')
                descripcion = request.data.get('descripcion', '')

                if not imagen_b64:
                    return Response({'detail': 'Imagen requerida.'}, status=400)

                prompt = (
                    f"Eres un experto en fitopatología de biohuertos urbanos en Lambayeque, Perú.\n"
                    f"Analiza esta imagen de un cultivo de {cultivo_nombre} e identifica "
                    f"plagas, enfermedades o deficiencias nutricionales.\n"
                    + (f"Descripción adicional del productor: {descripcion}\n" if descripcion else '')
                    + f"\nResponde ÚNICAMENTE con el siguiente JSON (sin texto adicional):\n{JSON_SCHEMA}"
                )

                message = client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=1024,
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": imagen_b64,
                                },
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }],
                )

            else:  # formulario
                parte = request.data.get('parte_afectada', '')
                sintomas = request.data.get('sintomas', [])

                if not parte or not sintomas:
                    return Response(
                        {'detail': 'Parte afectada y síntomas son requeridos.'}, status=400
                    )

                sintomas_texto = ', '.join(s.replace('_', ' ') for s in sintomas)

                prompt = (
                    f"Eres un experto en fitopatología de biohuertos urbanos en Lambayeque, Perú.\n"
                    f"Un productor reporta el siguiente problema en su cultivo de {cultivo_nombre}:\n"
                    f"- Parte afectada: {parte.replace('_', ' ')}\n"
                    f"- Síntomas observados: {sintomas_texto}\n\n"
                    f"Identifica el problema fitosanitario más probable y proporciona recomendaciones "
                    f"de manejo orgánico adaptadas al clima cálido y húmedo de Lambayeque.\n\n"
                    f"Responde ÚNICAMENTE con el siguiente JSON (sin texto adicional):\n{JSON_SCHEMA}"
                )

                message = client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}],
                )

            texto = message.content[0].text.strip()
            resultado = _parsear_respuesta_claude(texto)

            if resultado:
                return Response(resultado)

            # Fallback al análisis estático si el parse falla
            if metodo == 'formulario':
                return Response(_analizar_sintomas(parte, sintomas))
            return Response({
                'diagnostico_probable': 'No determinado',
                'causa_probable': 'No se pudo procesar la respuesta de IA.',
                'recomendacion': 'Consulta con un técnico agroecológico.',
                'severidad': 'moderado',
                'acciones_preventivas': [],
            })

        except Exception as e:
            # Si falla la llamada a la API, usar análisis estático
            if metodo == 'formulario':
                parte = request.data.get('parte_afectada', '')
                sintomas = request.data.get('sintomas', [])
                return Response(_analizar_sintomas(parte, sintomas))
            return Response(
                {'detail': f'Error en el servicio de IA: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class DiagnosticosBaseView(APIView):
    """Lista todos los problemas de la base de datos estática."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_cargar_base_diagnosticos())
