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
    serializer_class   = DiagnosticoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def get_queryset(self):
        qs = Diagnostico.objects.select_related(
            'productor', 'variedad', 'campana'
        ).filter(productor=self.request.user)
        variedad_id = self.request.query_params.get('variedad')
        campana_id  = self.request.query_params.get('campana')
        if variedad_id:
            qs = qs.filter(variedad_id=variedad_id)
        if campana_id:
            qs = qs.filter(campana_id=campana_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(productor=self.request.user)


class DiagnosticoDetail(generics.RetrieveDestroyAPIView):
    serializer_class   = DiagnosticoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def get_queryset(self):
        return Diagnostico.objects.select_related(
            'productor', 'variedad', 'campana'
        ).filter(productor=self.request.user)


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


JSON_SCHEMA = '''{
  "diagnostico_probable": "nombre del problema",
  "causa_probable": "descripción breve de la causa",
  "recomendacion": "recomendación de manejo orgánico adaptada a Lambayeque",
  "severidad": "leve|moderado|grave",
  "acciones_preventivas": ["acción 1", "acción 2", "acción 3"]
}'''


def _prompt_formulario(planta_desc, parte, sintomas):
    sintomas_texto = ', '.join(s.replace('_', ' ') for s in sintomas)
    return (
        f"Eres un experto en fitopatología de biohuertos urbanos en Lambayeque, Perú.\n"
        f"Un productor reporta el siguiente problema en su cultivo de {planta_desc}:\n"
        f"- Parte afectada: {parte.replace('_', ' ')}\n"
        f"- Síntomas observados: {sintomas_texto}\n\n"
        f"Identifica el problema fitosanitario más probable y proporciona recomendaciones "
        f"de manejo orgánico adaptadas al clima cálido y húmedo de Lambayeque.\n\n"
        f"Responde ÚNICAMENTE con el siguiente JSON (sin texto adicional):\n{JSON_SCHEMA}"
    )


def _prompt_imagen(planta_desc, descripcion):
    return (
        f"Eres un experto en fitopatología de biohuertos urbanos en Lambayeque, Perú.\n"
        f"Analiza esta imagen de un cultivo de {planta_desc} e identifica "
        f"plagas, enfermedades o deficiencias nutricionales.\n"
        + (f"Descripción adicional del productor: {descripcion}\n" if descripcion else '')
        + f"\nResponde ÚNICAMENTE con el siguiente JSON (sin texto adicional):\n{JSON_SCHEMA}"
    )


def _analizar_con_gemini(metodo, cultivo_nombre, parte='', sintomas=None, imagen_b64='', media_type='image/jpeg', descripcion=''):
    """Análisis usando Google Gemini (fallback gratuito)."""
    import os, base64, time
    from google import genai
    from google.genai import types

    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    if not gemini_key:
        return None

    client = genai.Client(api_key=gemini_key)

    if metodo == 'imagen':
        prompt = _prompt_imagen(cultivo_nombre, descripcion)
        img_bytes = base64.b64decode(imagen_b64)
        contents = [
            types.Part.from_bytes(data=img_bytes, mime_type=media_type),
            prompt,
        ]
    else:
        prompt = _prompt_formulario(cultivo_nombre, parte, sintomas or [])
        contents = prompt

    last_exc = None
    for intento in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
            )
            return _parsear_respuesta_claude(response.text.strip())
        except Exception as e:
            last_exc = e
            if '503' in str(e) or 'UNAVAILABLE' in str(e):
                time.sleep(3)
                continue
            raise
    raise last_exc


class DiagnosticoClaudeView(APIView):
    """Diagnóstico asistido por IA: intenta Claude, cae a Gemini, luego a análisis estático."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        metodo          = request.data.get('metodo', 'formulario')
        # Acepta variedad_desc (nuevo) o cultivo_nombre (compatibilidad)
        variedad_desc   = request.data.get('variedad_desc') or request.data.get('cultivo_nombre', 'cultivo')
        parte           = request.data.get('parte_afectada', '')
        sintomas        = request.data.get('sintomas', [])
        imagen_b64      = request.data.get('imagen', '')
        media_type      = request.data.get('media_type', 'image/jpeg')
        descripcion     = request.data.get('descripcion', '')

        if metodo == 'imagen' and not imagen_b64:
            return Response({'detail': 'Imagen requerida.'}, status=400)
        if metodo == 'formulario' and (not parte or not sintomas):
            return Response({'detail': 'Parte afectada y síntomas son requeridos.'}, status=400)

        # ── 1. Intentar con Claude ──────────────────────────────────
        resultado = self._intentar_claude(metodo, variedad_desc, parte, sintomas, imagen_b64, media_type, descripcion)
        if resultado:
            return Response(resultado)

        # ── 2. Intentar con Gemini ──────────────────────────────────
        try:
            from google import genai  # noqa
            resultado = _analizar_con_gemini(metodo, variedad_desc, parte, sintomas, imagen_b64, media_type, descripcion)
            if resultado:
                return Response(resultado)
        except Exception as e:
            print(f'[Gemini] Error: {e}')

        # ── 3. Fallback estático ────────────────────────────────────
        if metodo == 'formulario':
            return Response(_analizar_sintomas(parte, sintomas))
        return Response({
            'diagnostico_probable': 'No determinado',
            'causa_probable': 'No se pudo procesar la imagen con IA.',
            'recomendacion': 'Consulta con un técnico agroecológico.',
            'severidad': 'moderado',
            'acciones_preventivas': [],
        })

    def _intentar_claude(self, metodo, cultivo_nombre, parte, sintomas, imagen_b64, media_type, descripcion):
        try:
            import anthropic
        except ImportError:
            return None

        try:
            client = anthropic.Anthropic()
        except Exception:
            return None

        try:
            if metodo == 'imagen':
                prompt = _prompt_imagen(cultivo_nombre, descripcion)
                message = client.messages.create(
                    model='claude-sonnet-4-6',
                    max_tokens=1024,
                    messages=[{
                        'role': 'user',
                        'content': [
                            {'type': 'image', 'source': {'type': 'base64', 'media_type': media_type, 'data': imagen_b64}},
                            {'type': 'text', 'text': prompt},
                        ],
                    }],
                )
            else:
                prompt = _prompt_formulario(cultivo_nombre, parte, sintomas)
                message = client.messages.create(
                    model='claude-sonnet-4-6',
                    max_tokens=1024,
                    messages=[{'role': 'user', 'content': prompt}],
                )
            return _parsear_respuesta_claude(message.content[0].text.strip())
        except Exception as e:
            print(f'[Claude] Error: {e}')
            return None


class DiagnosticosBaseView(APIView):
    """Lista todos los problemas de la base de datos estática."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_cargar_base_diagnosticos())
