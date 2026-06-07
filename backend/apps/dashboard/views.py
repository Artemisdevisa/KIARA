from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from django.utils import timezone


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        hoy = date.today()
        inicio_mes = hoy.replace(day=1)
        en_7_dias = hoy + timedelta(days=7)

        from apps.cultivos.models import Cultivo
        from apps.alertas.models import Alerta
        from apps.cosechas.models import Cosecha
        from apps.trazabilidad.models import PracticaSostenible, Costo
        from apps.biohuertos.models import Biohuerto

        biohuertos = Biohuerto.objects.filter(productor=user, activo=True)
        cultivos_activos = Cultivo.objects.filter(
            biohuerto__in=biohuertos, estado='activo'
        ).count()

        proximas_cosechas = Cultivo.objects.filter(
            biohuerto__in=biohuertos,
            estado='activo',
            fecha_estimada_cosecha__range=[hoy, en_7_dias]
        ).values('id', 'nombre', 'fecha_estimada_cosecha', 'biohuerto__nombre')

        alertas_pendientes = Alerta.objects.filter(
            cultivo__biohuerto__in=biohuertos,
            completada=False
        ).count()

        cosechas_activas = Cosecha.objects.filter(
            biohuerto__in=biohuertos, estado='disponible'
        ).count()

        costo_mes = Costo.objects.filter(
            cultivo__biohuerto__in=biohuertos,
            fecha__gte=inicio_mes
        ).aggregate(total=Sum('monto'))['total'] or 0

        practicas_mes = PracticaSostenible.objects.filter(
            cultivo__biohuerto__in=biohuertos,
            fecha__gte=inicio_mes
        ).count()

        if practicas_mes >= 2:
            semaforo = 'verde'
        elif practicas_mes == 1:
            semaforo = 'amarillo'
        else:
            semaforo = 'rojo'

        return Response({
            'cultivos_activos': cultivos_activos,
            'proximas_cosechas': list(proximas_cosechas),
            'alertas_pendientes': alertas_pendientes,
            'cosechas_activas': cosechas_activas,
            'costo_total_mes': float(costo_mes),
            'practicas_mes': practicas_mes,
            'semaforo_ambiental': semaforo,
            'total_biohuertos': biohuertos.count(),
        })
