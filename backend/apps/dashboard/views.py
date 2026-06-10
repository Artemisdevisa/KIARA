from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        hoy = date.today()
        inicio_mes = hoy.replace(day=1)
        en_7_dias = hoy + timedelta(days=7)

        from apps.cultivos.models import Cultivo
        from apps.campanas.models import Campana, CampanaAlerta, PracticaSostenible as PracticaCampana
        from apps.cosechas.models import Cosecha
        from apps.trazabilidad.models import Costo
        from apps.biohuertos.models import Biohuerto

        biohuertos = Biohuerto.objects.filter(productor=user, activo=True)
        cultivos_activos = Cultivo.objects.filter(
            biohuerto__in=biohuertos, estado='activo'
        ).count()
        campanas_activas = Campana.objects.filter(
            biohuerto__in=biohuertos, estado='activa'
        ).count()

        proximas_cosechas = list(
            Campana.objects.filter(
                biohuerto__in=biohuertos,
                estado__in=['activa', 'planificada'],
            ).order_by('fecha_fin').values('codigo', 'variedad__nombre', 'fecha_fin', 'biohuerto__nombre')
        )
        for c in proximas_cosechas:
            c['nombre']                  = c.pop('variedad__nombre') or ''
            c['fecha_estimada_cosecha']  = str(c.pop('fecha_fin'))
            c['biohuerto__nombre']       = c.get('biohuerto__nombre', '')

        alertas_pendientes = CampanaAlerta.objects.filter(
            campana__biohuerto__in=biohuertos,
            completada=False
        ).count()

        cosechas_activas = Cosecha.objects.filter(
            biohuerto__in=biohuertos, estado='disponible'
        ).count()

        costo_mes = Costo.objects.filter(
            cultivo__biohuerto__in=biohuertos,
            fecha__gte=inicio_mes
        ).aggregate(total=Sum('monto'))['total'] or 0

        practicas_mes = PracticaCampana.objects.filter(
            campana__biohuerto__in=biohuertos,
            fecha__gte=inicio_mes
        ).count()

        # También contar productos fitosanitarios marcados como sostenibles y aplicados este mes
        from apps.campanas.models import ItemFitosanitario
        fito_sostenible_mes = ItemFitosanitario.objects.filter(
            campana__biohuerto__in=biohuertos,
            es_sostenible=True,
            estado='aplicado',
            fecha_aplicada__gte=inicio_mes
        ).count()

        practicas_total = practicas_mes + fito_sostenible_mes

        if practicas_total >= 2:
            semaforo = 'verde'
        elif practicas_total == 1:
            semaforo = 'amarillo'
        else:
            semaforo = 'rojo'

        # Detalle prácticas del mes (registro manual)
        practicas_detalle = list(
            PracticaCampana.objects.filter(
                campana__biohuerto__in=biohuertos, fecha__gte=inicio_mes
            ).select_related('campana__variedad').values('fecha', 'tipo', 'campana__variedad__nombre')
        )
        for p in practicas_detalle:
            p['fecha'] = str(p['fecha'])
            p['cultivo__nombre'] = p.pop('campana__variedad__nombre') or ''

        # Detalle fitosanitarios sostenibles aplicados este mes
        fito_detalle = list(
            ItemFitosanitario.objects.filter(
                campana__biohuerto__in=biohuertos,
                es_sostenible=True,
                estado='aplicado',
                fecha_aplicada__gte=inicio_mes
            ).select_related('campana__variedad', 'producto')
            .values('fecha_aplicada', 'producto__nombre', 'campana__variedad__nombre')
        )
        for f in fito_detalle:
            practicas_detalle.append({
                'fecha':          str(f['fecha_aplicada']),
                'tipo':           f['producto__nombre'] or 'Producto sostenible',
                'cultivo__nombre': f['campana__variedad__nombre'] or '',
                'fuente':         'fitosanitario',
            })

        # Costos por concepto del mes
        from django.db.models import Sum as DSum
        costos_concepto_qs = (
            Costo.objects.filter(cultivo__biohuerto__in=biohuertos, fecha__gte=inicio_mes)
            .values('concepto')
            .annotate(total=DSum('monto'))
        )
        CONCEPTO_LABELS = {
            'insumos': 'Insumos', 'agua': 'Agua', 'semillas': 'Semillas',
            'mano_obra': 'Mano de obra', 'herramientas': 'Herramientas', 'otro': 'Otro',
        }
        costos_por_concepto = [
            {'concepto': CONCEPTO_LABELS.get(r['concepto'], r['concepto']), 'total': float(r['total'])}
            for r in costos_concepto_qs
        ]

        # Últimos 5 diagnósticos
        from apps.diagnosticos.models import Diagnostico
        ultimos_diagnosticos = list(
            Diagnostico.objects.filter(productor=user)
            .order_by('-fecha')[:5]
            .values('fecha', 'diagnostico_probable', 'severidad', 'variedad__nombre', 'campana__codigo')
        )
        for d in ultimos_diagnosticos:
            d['fecha'] = str(d['fecha'])
            d['cultivo__nombre'] = d.pop('variedad__nombre') or ''
            d['campana_codigo']  = d.pop('campana__codigo') or ''

        # Gasto por campaña (Labores + Fitosanitario aplicado)
        from apps.campanas.models import LaborCampana as LaborM

        campanas_activas_qs = Campana.objects.filter(
            biohuerto__in=biohuertos, estado__in=['activa', 'planificada']
        ).select_related('variedad', 'biohuerto').prefetch_related(
            'labores',
            'plan_fitosanitario__producto',
            'plan_fitosanitario__unidad',
        )

        def _fito_factor(codigo):
            s = (codigo or '').lower()
            return 0.001 if (s.startswith('ml') or s.startswith('cc') or s.startswith('g/') or s == 'g') else 1

        campanas_costos = []
        for c in campanas_activas_qs:
            area = float(c.area or 0)

            # Labores
            labor_pres = sum(
                float(l.cantidad_programada or 0) * float(l.costo_unitario or 0)
                for l in c.labores.all()
            )
            labor_ej = sum(
                float(l.cantidad_ejecutada or 0) * float(l.costo_unitario or 0)
                for l in c.labores.all() if l.estado == 'ejecutada'
            )

            # Fitosanitario
            fito_pres = fito_ej = 0.0
            for item in c.plan_fitosanitario.all():
                precio  = float(getattr(item.producto, 'precio_unitario', 0) or 0)
                codigo  = getattr(item.unidad, 'codigo', '') or ''
                cost    = float(item.dosis or 0) * area * precio * _fito_factor(codigo)
                fito_pres += cost
                if item.estado == 'aplicado':
                    fito_ej += cost

            campanas_costos.append({
                'codigo':        c.codigo,
                'variedad':      c.variedad.nombre if c.variedad else '',
                'biohuerto':     c.biohuerto.nombre if c.biohuerto else '',
                'presupuestado': round(labor_pres + fito_pres, 2),
                'ejecutado':     round(labor_ej + fito_ej, 2),
                'estado':        c.estado,
            })

        # Campañas activas con detalle
        campanas_detalle = list(
            Campana.objects.filter(
                biohuerto__in=biohuertos, estado='activa'
            ).values('codigo', 'variedad__nombre', 'biohuerto__nombre', 'fecha_inicio', 'fecha_fin', 'area')
        )
        for c in campanas_detalle:
            c['variedad']  = c.pop('variedad__nombre') or ''
            c['biohuerto'] = c.pop('biohuerto__nombre') or ''
            c['fecha_inicio'] = str(c['fecha_inicio']) if c['fecha_inicio'] else ''
            c['fecha_fin']    = str(c['fecha_fin'])    if c['fecha_fin']    else ''
            c['area']         = str(c['area'])         if c['area']         else ''

        # Alertas pendientes con detalle (máx 10)
        alertas_detalle = list(
            CampanaAlerta.objects.filter(
                campana__biohuerto__in=biohuertos, completada=False
            ).select_related('campana__variedad')
            .order_by('fecha_programada')[:10]
            .values('titulo', 'tipo', 'prioridad', 'fecha_programada', 'campana__variedad__nombre')
        )
        for a in alertas_detalle:
            a['fecha_programada'] = str(a['fecha_programada'])
            a['cultivo'] = a.pop('campana__variedad__nombre') or ''

        return Response({
            'cultivos_activos': cultivos_activos,
            'campanas_activas': campanas_activas,
            'proximas_cosechas': list(proximas_cosechas),
            'alertas_pendientes': alertas_pendientes,
            'cosechas_activas': cosechas_activas,
            'costo_total_mes': float(costo_mes),
            'practicas_mes': practicas_total,
            'semaforo_ambiental': semaforo,
            'total_biohuertos': biohuertos.count(),
            'practicas_detalle': practicas_detalle,
            'costos_por_concepto': costos_por_concepto,
            'ultimos_diagnosticos': ultimos_diagnosticos,
            'campanas_detalle': campanas_detalle,
            'alertas_detalle': alertas_detalle,
            'campanas_costos': campanas_costos,
        })
