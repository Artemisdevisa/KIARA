from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import MonitoreoRegistro
from .serializers import MonitoreoRegistroSerializer

# Rangos óptimos para biohuertos en Lambayeque
TEMP_MIN, TEMP_MAX = 15.0, 35.0   # °C
HUM_MIN,  HUM_MAX  = 40.0, 90.0   # %


def _generar_alertas(biohuerto, temperatura, humedad):
    """Crea CampanaAlertas en las campañas activas si los valores están fuera de rango."""
    from apps.campanas.models import Campana, CampanaAlerta

    campanas_activas = Campana.objects.filter(biohuerto=biohuerto, estado='activa')
    if not campanas_activas.exists():
        return []

    hoy = timezone.localdate()
    alertas_creadas = []

    for campana in campanas_activas:
        mensajes = []

        if temperatura is not None:
            if float(temperatura) > TEMP_MAX:
                mensajes.append({
                    'tipo': 'control',
                    'titulo': f'Temperatura alta ({temperatura}°C) — riesgo para el cultivo',
                    'descripcion': f'Se registró {temperatura}°C en el biohuerto. Temperatura óptima: {TEMP_MIN}–{TEMP_MAX}°C. Considera sombrear o ventilar.',
                    'prioridad': 'alta',
                })
            elif float(temperatura) < TEMP_MIN:
                mensajes.append({
                    'tipo': 'control',
                    'titulo': f'Temperatura baja ({temperatura}°C) — riesgo de helada',
                    'descripcion': f'Se registró {temperatura}°C en el biohuerto. Temperatura óptima: {TEMP_MIN}–{TEMP_MAX}°C. Considera cubrir los cultivos.',
                    'prioridad': 'alta',
                })

        if humedad is not None:
            if float(humedad) < HUM_MIN:
                mensajes.append({
                    'tipo': 'riego',
                    'titulo': f'Humedad baja ({humedad}%) — revisar riego urgente',
                    'descripcion': f'Se registró {humedad}% de humedad. Rango óptimo: {HUM_MIN}–{HUM_MAX}%. El cultivo puede estar en estrés hídrico.',
                    'prioridad': 'alta',
                })
            elif float(humedad) > HUM_MAX:
                mensajes.append({
                    'tipo': 'control',
                    'titulo': f'Humedad alta ({humedad}%) — riesgo de hongos',
                    'descripcion': f'Se registró {humedad}% de humedad. Rango óptimo: {HUM_MIN}–{HUM_MAX}%. Condiciones favorables para enfermedades fúngicas.',
                    'prioridad': 'media',
                })

        for m in mensajes:
            alerta = CampanaAlerta.objects.create(
                campana=campana,
                tipo=m['tipo'],
                titulo=m['titulo'],
                descripcion=m['descripcion'],
                fecha_programada=hoy,
                prioridad=m['prioridad'],
            )
            alertas_creadas.append({
                'campana_codigo': campana.codigo,
                'titulo': alerta.titulo,
                'prioridad': alerta.prioridad,
            })

    return alertas_creadas


class MonitoreoListCreate(generics.ListCreateAPIView):
    serializer_class = MonitoreoRegistroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = MonitoreoRegistro.objects.filter(biohuerto__productor=self.request.user)
        biohuerto_id = self.request.query_params.get('biohuerto')
        if biohuerto_id:
            qs = qs.filter(biohuerto_id=biohuerto_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registro = serializer.save()

        alertas = _generar_alertas(
            biohuerto=registro.biohuerto,
            temperatura=registro.temperatura,
            humedad=registro.humedad,
        )

        data = serializer.data
        data['alertas_generadas'] = alertas
        return Response(data, status=status.HTTP_201_CREATED)


class MonitoreoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MonitoreoRegistroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoreoRegistro.objects.filter(biohuerto__productor=self.request.user)
