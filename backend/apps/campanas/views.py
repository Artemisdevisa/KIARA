from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import datetime
from .models import (
    Variedad, ProductoAgricola, TipoLabor,
    UnidadMedida, Plaga, Objetivo, Condicion,
    Campana, LaborCampana, ItemFitosanitario,
    RegistroAplicacion, PlanRiego, RegistroRiego,
    PresupuestoItem, PracticaSostenible, PlantillaProducto, PlantillaLabor,
    PlantillaRiego, CampanaAlerta,
)
from .serializers import (
    VariedadSerializer, ProductoAgricolaSerializer, TipoLaborSerializer,
    UnidadMedidaSerializer, PlagaSerializer, ObjetivoSerializer, CondicionSerializer,
    CampanaSerializer, LaborCampanaSerializer, ItemFitosanitarioSerializer,
    RegistroAplicacionSerializer, PlanRiegoSerializer, RegistroRiegoSerializer,
    PresupuestoItemSerializer, PracticaSostenibleSerializer,
    PlantillaProductoSerializer, PlantillaLaborSerializer, PlantillaRiegoSerializer,
    CampanaAlertaSerializer,
)


# ── Catálogos base ────────────────────────────────────────────────

class VariedadListCreate(generics.ListCreateAPIView):
    queryset           = Variedad.objects.all()
    serializer_class   = VariedadSerializer
    permission_classes = [permissions.IsAuthenticated]


class VariedadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Variedad.objects.all()
    serializer_class   = VariedadSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductoListCreate(generics.ListCreateAPIView):
    queryset           = ProductoAgricola.objects.all()
    serializer_class   = ProductoAgricolaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = ProductoAgricola.objects.all()
    serializer_class   = ProductoAgricolaSerializer
    permission_classes = [permissions.IsAuthenticated]


class TipoLaborListCreate(generics.ListCreateAPIView):
    queryset           = TipoLabor.objects.all()
    serializer_class   = TipoLaborSerializer
    permission_classes = [permissions.IsAuthenticated]


class TipoLaborDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = TipoLabor.objects.all()
    serializer_class   = TipoLaborSerializer
    permission_classes = [permissions.IsAuthenticated]


# ── Catálogos de apoyo ────────────────────────────────────────────

class UnidadMedidaListCreate(generics.ListCreateAPIView):
    queryset           = UnidadMedida.objects.all()
    serializer_class   = UnidadMedidaSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnidadMedidaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = UnidadMedida.objects.all()
    serializer_class   = UnidadMedidaSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlagaListCreate(generics.ListCreateAPIView):
    queryset           = Plaga.objects.all()
    serializer_class   = PlagaSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlagaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Plaga.objects.all()
    serializer_class   = PlagaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ObjetivoListCreate(generics.ListCreateAPIView):
    queryset           = Objetivo.objects.select_related('plaga').all()
    serializer_class   = ObjetivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class ObjetivoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Objetivo.objects.select_related('plaga').all()
    serializer_class   = ObjetivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class CondicionListCreate(generics.ListCreateAPIView):
    queryset           = Condicion.objects.all()
    serializer_class   = CondicionSerializer
    permission_classes = [permissions.IsAuthenticated]


class CondicionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Condicion.objects.all()
    serializer_class   = CondicionSerializer
    permission_classes = [permissions.IsAuthenticated]


# ── Campañas ─────────────────────────────────────────────────────

class CampanaListCreate(generics.ListCreateAPIView):
    serializer_class   = CampanaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Campana.objects.filter(biohuerto__productor=self.request.user).select_related('variedad', 'biohuerto')

    def perform_create(self, serializer):
        biohuerto = serializer.validated_data['biohuerto']
        variedad  = serializer.validated_data['variedad']
        anio      = serializer.validated_data['anio']
        fecha_ini = serializer.validated_data['fecha_inicio']
        count     = Campana.objects.filter(biohuerto=biohuerto, anio=anio).count() + 1
        codigo    = f'CA-{biohuerto.codigo or biohuerto.id}-{anio}-{count:02d}'
        campana   = serializer.save(codigo=codigo)

        for pp in PlantillaProducto.objects.filter(variedad=variedad).select_related('producto', 'objetivo', 'unidad', 'condicion', 'plaga'):
            fecha_inicio_fito = fecha_ini + datetime.timedelta(weeks=pp.semana_relativa) if pp.semana_relativa is not None else None
            ItemFitosanitario.objects.create(
                campana=campana, producto=pp.producto,
                objetivo=pp.objetivo, plaga=pp.plaga,
                dosis=pp.dosis or 0, unidad=pp.unidad,
                dias_antes_cosecha=pp.dias_antes_cosecha,
                frecuencia_dias=pp.frecuencia_dias,
                condicion=pp.condicion,
                etapa=pp.etapa,
                fecha_inicio=fecha_inicio_fito,
            )

        for pl in PlantillaLabor.objects.filter(variedad=variedad).select_related('tipo_labor'):
            fecha_prog = fecha_ini + datetime.timedelta(weeks=pl.semana_relativa) if pl.semana_relativa is not None else fecha_ini
            LaborCampana.objects.create(
                campana=campana, tipo_labor=pl.tipo_labor,
                cantidad_programada=pl.cantidad,
                costo_unitario=pl.tipo_labor.costo_unitario_default,
                fecha_programada=fecha_prog,
                etapa=pl.etapa,
                notas=pl.notas,
            )

        for pr in PlantillaRiego.objects.filter(variedad=variedad).select_related('fertilizante'):
            fecha_inicio_riego = fecha_ini + datetime.timedelta(weeks=pr.semana_relativa) if pr.semana_relativa is not None else fecha_ini
            PlanRiego.objects.create(
                campana=campana,
                nombre=pr.nombre,
                metodo=pr.metodo,
                litros_por_m2=pr.litros_por_m2,
                frecuencia_dias=pr.frecuencia_dias,
                duracion_minutos=pr.duracion_minutos,
                fertilizante=pr.fertilizante,
                dosis_fertilizante=pr.dosis_fertilizante,
                fecha_inicio=fecha_inicio_riego,
            )


class CampanaDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CampanaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Campana.objects.filter(biohuerto__productor=self.request.user)


# ── Mixin para vistas anidadas bajo una campaña ───────────────────

class CampanaMixin:
    permission_classes = [permissions.IsAuthenticated]

    def _campana(self):
        return get_object_or_404(
            Campana,
            pk=self.kwargs['campana_pk'],
            biohuerto__productor=self.request.user,
        )


# ── Labores ───────────────────────────────────────────────────────

class LaborListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = LaborCampanaSerializer

    def get_queryset(self):
        return LaborCampana.objects.filter(campana=self._campana()).select_related('tipo_labor')

    def perform_create(self, serializer):
        tl    = serializer.validated_data.get('tipo_labor')
        costo = tl.costo_unitario_default if tl else 0
        serializer.save(campana=self._campana(), costo_unitario=serializer.validated_data.get('costo_unitario', costo))


class LaborDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = LaborCampanaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LaborCampana.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Fitosanitario ─────────────────────────────────────────────────

class FitosanitarioListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = ItemFitosanitarioSerializer

    def get_queryset(self):
        return ItemFitosanitario.objects.filter(campana=self._campana()).select_related('producto', 'objetivo', 'plaga', 'unidad', 'condicion')

    def perform_create(self, serializer):
        item = serializer.save(campana=self._campana())
        _generar_alertas_campana(item.campana)


class FitosanitarioDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ItemFitosanitarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ItemFitosanitario.objects.filter(campana__biohuerto__productor=self.request.user)

    def perform_update(self, serializer):
        item = serializer.save()
        _generar_alertas_campana(item.campana)

    def perform_destroy(self, instance):
        campana = instance.campana
        instance.delete()
        _generar_alertas_campana(campana)


# ── Registros de aplicación ───────────────────────────────────────

class AplicacionListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = RegistroAplicacionSerializer

    def get_queryset(self):
        return RegistroAplicacion.objects.filter(campana=self._campana()).select_related('producto')

    def perform_create(self, serializer):
        prod  = serializer.validated_data['producto']
        dosis = serializer.validated_data['dosis_aplicada']
        area  = serializer.validated_data['area_aplicada']
        costo = float(dosis * area * prod.precio_unitario)
        instance = serializer.save(campana=self._campana(), costo_total=round(costo, 2))
        # Auto-completar plan si se alcanzó el número de aplicaciones definido
        item_plan = instance.item_plan
        if item_plan and item_plan.numero_aplicaciones:
            count = RegistroAplicacion.objects.filter(item_plan=item_plan).count()
            if count >= item_plan.numero_aplicaciones and item_plan.estado != 'aplicado':
                item_plan.estado = 'aplicado'
                item_plan.fecha_aplicada = instance.fecha
                item_plan.save()


class AplicacionDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = RegistroAplicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RegistroAplicacion.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Plan de riego ─────────────────────────────────────────────────

class PlanRiegoListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = PlanRiegoSerializer

    def get_queryset(self):
        return PlanRiego.objects.filter(campana=self._campana())

    def perform_create(self, serializer):
        serializer.save(campana=self._campana())


class PlanRiegoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlanRiegoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlanRiego.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Registros de riego ────────────────────────────────────────────

class RegistroRiegoListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = RegistroRiegoSerializer

    def get_queryset(self):
        return RegistroRiego.objects.filter(campana=self._campana())

    def perform_create(self, serializer):
        instance = serializer.save(campana=self._campana())
        plan = instance.plan
        if plan and plan.numero_riegos:
            count = RegistroRiego.objects.filter(plan=plan).count()
            if count >= plan.numero_riegos and not plan.completado:
                plan.completado = True
                plan.operario = instance.operario or plan.operario
                plan.save()


class RegistroRiegoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = RegistroRiegoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RegistroRiego.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Presupuesto ───────────────────────────────────────────────────

class PresupuestoListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = PresupuestoItemSerializer

    def get_queryset(self):
        return PresupuestoItem.objects.filter(campana=self._campana())

    def perform_create(self, serializer):
        serializer.save(campana=self._campana())


class PresupuestoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PresupuestoItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PresupuestoItem.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Prácticas sostenibles ─────────────────────────────────────────

class PracticaListCreate(CampanaMixin, generics.ListCreateAPIView):
    serializer_class = PracticaSostenibleSerializer

    def get_queryset(self):
        return PracticaSostenible.objects.filter(campana=self._campana())

    def perform_create(self, serializer):
        serializer.save(campana=self._campana())


class PracticaDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PracticaSostenibleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PracticaSostenible.objects.filter(campana__biohuerto__productor=self.request.user)


# ── Plantillas de variedad ────────────────────────────────────────

class PlantillaProductoListCreate(generics.ListCreateAPIView):
    serializer_class   = PlantillaProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlantillaProducto.objects.filter(variedad_id=self.kwargs['variedad_pk']).select_related('producto', 'objetivo', 'plaga', 'unidad', 'condicion')

    def perform_create(self, serializer):
        variedad = get_object_or_404(Variedad, pk=self.kwargs['variedad_pk'])
        serializer.save(variedad=variedad)


class PlantillaProductoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlantillaProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = PlantillaProducto.objects.all()


class PlantillaLaborListCreate(generics.ListCreateAPIView):
    serializer_class   = PlantillaLaborSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlantillaLabor.objects.filter(variedad_id=self.kwargs['variedad_pk']).select_related('tipo_labor')

    def perform_create(self, serializer):
        variedad = get_object_or_404(Variedad, pk=self.kwargs['variedad_pk'])
        serializer.save(variedad=variedad)


class PlantillaLaborDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlantillaLaborSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = PlantillaLabor.objects.all()


class PlantillaRiegoListCreate(generics.ListCreateAPIView):
    serializer_class   = PlantillaRiegoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlantillaRiego.objects.filter(variedad_id=self.kwargs['variedad_pk']).select_related('fertilizante')

    def perform_create(self, serializer):
        variedad = get_object_or_404(Variedad, pk=self.kwargs['variedad_pk'])
        serializer.save(variedad=variedad)


class PlantillaRiegoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlantillaRiegoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = PlantillaRiego.objects.all()


# ── Alertas de campaña ────────────────────────────────────────────

class CampanaAlertaListCreate(generics.ListCreateAPIView):
    serializer_class   = CampanaAlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        campana = get_object_or_404(Campana, pk=self.kwargs['campana_pk'], biohuerto__productor=self.request.user)
        return CampanaAlerta.objects.filter(campana=campana)

    def perform_create(self, serializer):
        campana = get_object_or_404(Campana, pk=self.kwargs['campana_pk'], biohuerto__productor=self.request.user)
        serializer.save(campana=campana)


class CampanaAlertaDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CampanaAlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CampanaAlerta.objects.filter(campana__biohuerto__productor=self.request.user)


def _generar_alertas_campana(campana):
    """
    Regenera todas las alertas automáticas de una campaña.
    Llamado tanto desde GenerarAlertasView como al guardar ítems
    fitosanitarios, riego y labores.
    """
    today     = datetime.date.today()
    fecha_ref = campana.fecha_inicio or today
    nuevas    = []

    campana.alertas.filter(completada=False).delete()

    # Fecha fin real o estimada (fecha_inicio + dias_ciclo de la variedad)
    fecha_fin = campana.fecha_fin
    if not fecha_fin and campana.fecha_inicio:
        try:
            dias_ciclo = campana.variedad.dias_ciclo
            if dias_ciclo:
                fecha_fin = campana.fecha_inicio + datetime.timedelta(days=dias_ciclo)
        except Exception:
            pass

    # 1. Cosecha
    if fecha_fin:
        dias = (fecha_fin - today).days
        prioridad = 'alta' if dias <= 7 else ('media' if dias <= 21 else 'baja')
        desc_extra = '' if campana.fecha_fin else ' (fecha estimada por ciclo de variedad)'
        CampanaAlerta.objects.create(
            campana=campana, tipo='cosecha', origen='sistema',
            titulo='Cosecha programada',
            descripcion=f'La campaña finaliza el {fecha_fin.strftime("%d/%m/%Y")}{desc_extra}. Preparar herramientas y empaques.',
            fecha_programada=fecha_fin,
            prioridad=prioridad,
        )
        nuevas.append('cosecha')

        if -30 <= dias <= 30:
            CampanaAlerta.objects.create(
                campana=campana, tipo='rotacion', origen='sistema',
                titulo='Planificar rotación de cultivos',
                descripcion='La campaña finaliza pronto. Considerar rotación con leguminosas o raíces para recuperar el suelo.',
                fecha_programada=fecha_fin + datetime.timedelta(days=7),
                prioridad='baja',
            )
            nuevas.append('rotacion')

    # 2. Intervalos de seguridad fitosanitarios
    # Solo etapas cercanas a cosecha — en preparación/germinación el producto
    # ya se metabolizó mucho antes, el intervalo de seguridad no aplica.
    ETAPAS_CERCANAS_COSECHA = ['crecimiento', 'establecido', 'floracion', 'cosecha', 'brotacion', 'poda', '']
    fito_pendientes = campana.plan_fitosanitario.filter(
        dias_antes_cosecha__isnull=False,
        etapa__in=ETAPAS_CERCANAS_COSECHA,
        activo=True,
        estado='programado',
    ).select_related('producto')

    for item in fito_pendientes:
        if fecha_fin:
            fecha_limite = fecha_fin - datetime.timedelta(days=item.dias_antes_cosecha)
            dias_para_limite = (fecha_limite - today).days
            prioridad = 'alta' if dias_para_limite <= 3 else ('media' if dias_para_limite <= 10 else 'baja')
            origen_fecha = '' if campana.fecha_fin else ' (fecha cosecha estimada)'
            CampanaAlerta.objects.create(
                campana=campana, tipo='seguridad', origen='sistema',
                titulo=f'Límite de aplicación: {item.producto.nombre}',
                descripcion=(
                    f'Intervalo de seguridad: {item.dias_antes_cosecha} días antes de cosecha{origen_fecha}. '
                    f'No aplicar después del {fecha_limite.strftime("%d/%m/%Y")}.'
                ),
                fecha_programada=fecha_limite,
                prioridad=prioridad,
            )
            nuevas.append('seguridad')

    # 2b. Recordatorio de primera aplicación para ítems con fecha_inicio y sin frecuencia
    fito_unica = campana.plan_fitosanitario.filter(
        fecha_inicio__isnull=False,
        frecuencia_dias__isnull=True,
        estado='programado',
        activo=True,
    ).select_related('producto', 'objetivo')

    for item in fito_unica:
        if item.fecha_inicio >= today:
            objetivo_txt = item.objetivo.nombre if item.objetivo else ''
            tipo = 'fertilizacion' if 'fertili' in objetivo_txt.lower() else 'control'
            dias_para_app = (item.fecha_inicio - today).days
            prioridad = 'alta' if dias_para_app <= 2 else ('media' if dias_para_app <= 7 else 'baja')
            CampanaAlerta.objects.create(
                campana=campana, tipo=tipo, origen='sistema',
                titulo=f'Aplicación programada: {item.producto.nombre}',
                descripcion=f'Etapa: {item.get_etapa_display()}. Aplicar el {item.fecha_inicio.strftime("%d/%m/%Y")}.',
                fecha_programada=item.fecha_inicio,
                prioridad=prioridad,
            )
            nuevas.append(tipo)

    # 3. Próximo riego por plan
    for plan in campana.plan_riego.filter(activo=True):
        base = plan.fecha_inicio or fecha_ref
        while base < today:
            base += datetime.timedelta(days=plan.frecuencia_dias)
        fert_txt = f' con {plan.fertilizante.nombre}' if plan.fertilizante else ''
        CampanaAlerta.objects.create(
            campana=campana, tipo='riego', origen='sistema',
            titulo=f'Riego: {plan.nombre}',
            descripcion=f'Método {plan.get_metodo_display()}{fert_txt}. '
                        f'{plan.litros_por_m2} L/m². Frecuencia: cada {plan.frecuencia_dias} días.',
            fecha_programada=base,
            prioridad='media',
        )
        nuevas.append('riego')

    # 4. Aplicaciones fitosanitarias/fertilización con frecuencia recurrente
    for item in campana.plan_fitosanitario.filter(frecuencia_dias__isnull=False, activo=True).select_related('producto', 'objetivo'):
        base = item.fecha_inicio or fecha_ref
        while base < today:
            base += datetime.timedelta(days=item.frecuencia_dias)
        objetivo_txt = item.objetivo.nombre if item.objetivo else ''
        tipo = 'fertilizacion' if 'fertili' in objetivo_txt.lower() or 'biol' in item.producto.nombre.lower() else 'control'
        estado_txt = ' (ya aplicado — próxima repetición)' if item.estado == 'aplicado' else ''
        CampanaAlerta.objects.create(
            campana=campana, tipo=tipo, origen='sistema',
            titulo=f'Aplicación: {item.producto.nombre}',
            descripcion=f'Etapa: {item.get_etapa_display()}. Aplicar cada {item.frecuencia_dias} días{estado_txt}.',
            fecha_programada=base,
            prioridad='media',
        )
        nuevas.append(tipo)

    # 5. Labores no ejecutadas
    # 5a. Atrasadas (fecha pasada, aún programadas) — prioridad alta
    for labor in campana.labores.filter(estado='programada', fecha_programada__lt=today).select_related('tipo_labor').order_by('fecha_programada')[:5]:
        dias_atraso = (today - labor.fecha_programada).days
        CampanaAlerta.objects.create(
            campana=campana, tipo='labor', origen='sistema',
            titulo=f'Labor atrasada: {labor.tipo_labor.nombre}',
            descripcion=f'Debía ejecutarse el {labor.fecha_programada.strftime("%d/%m/%Y")} (hace {dias_atraso} día{"s" if dias_atraso != 1 else ""}). Etapa: {labor.etapa or "sin etapa"}.',
            fecha_programada=labor.fecha_programada,
            prioridad='alta',
        )
        nuevas.append('labor')

    # 5b. Próximas (hasta 5 futuras)
    for labor in campana.labores.filter(estado='programada', fecha_programada__gte=today).select_related('tipo_labor').order_by('fecha_programada')[:5]:
        dias_para = (labor.fecha_programada - today).days
        prioridad = 'alta' if dias_para <= 1 else ('media' if dias_para <= 5 else 'baja')
        CampanaAlerta.objects.create(
            campana=campana, tipo='labor', origen='sistema',
            titulo=f'Labor: {labor.tipo_labor.nombre}',
            descripcion=f'Etapa: {labor.etapa or "sin etapa"}. Programada para el {labor.fecha_programada.strftime("%d/%m/%Y")}. {labor.descripcion or ""}',
            fecha_programada=labor.fecha_programada,
            prioridad=prioridad,
        )
        nuevas.append('labor')

    # 6. Riego: plan activo cuya próxima fecha ya pasó (incumplimiento)
    for plan in campana.plan_riego.filter(activo=True, completado=False):
        base = plan.fecha_inicio or fecha_ref
        if base > today:
            continue
        while base + datetime.timedelta(days=plan.frecuencia_dias) <= today:
            base += datetime.timedelta(days=plan.frecuencia_dias)
        # base es la última fecha prevista; si ya pasó y no está completado → alerta
        if base <= today:
            dias_atraso = (today - base).days
            fert_txt = f' con {plan.fertilizante.nombre}' if plan.fertilizante else ''
            CampanaAlerta.objects.create(
                campana=campana, tipo='riego', origen='sistema',
                titulo=f'Riego pendiente: {plan.nombre}',
                descripcion=(
                    f'El riego ({plan.get_metodo_display()}{fert_txt}, {plan.litros_por_m2} L/m²) '
                    f'debía realizarse el {base.strftime("%d/%m/%Y")}'
                    f'{f" (hace {dias_atraso} día{"s" if dias_atraso != 1 else ""})" if dias_atraso > 0 else " (hoy)"}.'
                ),
                fecha_programada=base,
                prioridad='alta' if dias_atraso > 1 else 'media',
            )
            nuevas.append('riego')

    return nuevas


class GenerarAlertasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, campana_pk):
        campana = get_object_or_404(Campana, pk=campana_pk, biohuerto__productor=request.user)
        nuevas  = _generar_alertas_campana(campana)
        alertas = CampanaAlerta.objects.filter(campana=campana)
        return Response({
            'generadas': len(nuevas),
            'tipos': list(set(nuevas)),
            'alertas': CampanaAlertaSerializer(alertas, many=True).data,
        })


class MisAlertasView(generics.ListAPIView):
    """Todas las CampanaAlertas del usuario a través de sus campañas."""
    serializer_class   = CampanaAlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CampanaAlerta.objects.filter(
            campana__biohuerto__productor=self.request.user
        ).select_related('campana', 'campana__variedad', 'campana__biohuerto')
        completada = self.request.query_params.get('completada')
        origen     = self.request.query_params.get('origen')
        if completada is not None:
            qs = qs.filter(completada=completada.lower() == 'true')
        if origen:
            qs = qs.filter(origen=origen)
        return qs


class CampanaAlertaCompletarView(APIView):
    """Marca una CampanaAlerta como completada."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        alerta = get_object_or_404(
            CampanaAlerta, pk=pk,
            campana__biohuerto__productor=request.user
        )
        alerta.completada = True
        alerta.save()
        return Response(CampanaAlertaSerializer(alerta).data)
