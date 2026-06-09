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
            ItemFitosanitario.objects.create(
                campana=campana, producto=pp.producto,
                objetivo=pp.objetivo, plaga=pp.plaga,
                dosis=pp.dosis or 0, unidad=pp.unidad,
                dias_antes_cosecha=pp.dias_antes_cosecha,
                frecuencia_dias=pp.frecuencia_dias,
                condicion=pp.condicion,
                etapa=pp.etapa,
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
            PlanRiego.objects.create(
                campana=campana,
                nombre=pr.nombre,
                metodo=pr.metodo,
                litros_por_m2=pr.litros_por_m2,
                frecuencia_dias=pr.frecuencia_dias,
                duracion_minutos=pr.duracion_minutos,
                fertilizante=pr.fertilizante,
                dosis_fertilizante=pr.dosis_fertilizante,
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
        serializer.save(campana=self._campana())


class FitosanitarioDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ItemFitosanitarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ItemFitosanitario.objects.filter(campana__biohuerto__productor=self.request.user)


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
        serializer.save(campana=self._campana(), costo_total=round(costo, 2))


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
        serializer.save(campana=self._campana())


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


class GenerarAlertasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, campana_pk):
        campana = get_object_or_404(Campana, pk=campana_pk, biohuerto__productor=request.user)
        today = datetime.date.today()
        fecha_ref = campana.fecha_inicio or today
        nuevas = []

        # Borrar alertas no completadas y regenerar
        campana.alertas.filter(completada=False).delete()

        # 1. Cosecha
        if campana.fecha_fin:
            dias = (campana.fecha_fin - today).days
            prioridad = 'alta' if dias <= 7 else ('media' if dias <= 21 else 'baja')
            CampanaAlerta.objects.create(
                campana=campana, tipo='cosecha',
                titulo='Cosecha programada',
                descripcion=f'La campaña finaliza el {campana.fecha_fin.strftime("%d/%m/%Y")}. Preparar herramientas y empaques.',
                fecha_programada=campana.fecha_fin,
                prioridad=prioridad,
            )
            nuevas.append('cosecha')

            # Rotación de cultivos si la campaña termina dentro de ±30 días
            if -30 <= dias <= 30:
                CampanaAlerta.objects.create(
                    campana=campana, tipo='rotacion',
                    titulo='Planificar rotación de cultivos',
                    descripcion='La campaña finaliza pronto. Considerar rotación con leguminosas o raíces para recuperar el suelo.',
                    fecha_programada=campana.fecha_fin + datetime.timedelta(days=7),
                    prioridad='baja',
                )
                nuevas.append('rotacion')

        # 2. Intervalos de seguridad fitosanitarios
        for item in campana.plan_fitosanitario.filter(dias_antes_cosecha__isnull=False, activo=True):
            if campana.fecha_fin:
                fecha_limite = campana.fecha_fin - datetime.timedelta(days=item.dias_antes_cosecha)
                CampanaAlerta.objects.create(
                    campana=campana, tipo='seguridad',
                    titulo=f'Límite de aplicación: {item.producto.nombre}',
                    descripcion=f'Intervalo de seguridad de {item.dias_antes_cosecha} días antes de cosecha. '
                                f'No aplicar después del {fecha_limite.strftime("%d/%m/%Y")}.',
                    fecha_programada=fecha_limite,
                    prioridad='alta',
                )
                nuevas.append('seguridad')

        # 3. Próximo riego por plan
        for plan in campana.plan_riego.filter(activo=True):
            base = plan.fecha_inicio or fecha_ref
            while base < today:
                base += datetime.timedelta(days=plan.frecuencia_dias)
            fert_txt = f' con {plan.fertilizante.nombre}' if plan.fertilizante else ''
            CampanaAlerta.objects.create(
                campana=campana, tipo='riego',
                titulo=f'Riego: {plan.nombre}',
                descripcion=f'Método {plan.get_metodo_display()}{fert_txt}. '
                            f'{plan.litros_por_m2} L/m². Frecuencia: cada {plan.frecuencia_dias} días.',
                fecha_programada=base,
                prioridad='media',
            )
            nuevas.append('riego')

        # 4. Aplicaciones fitosanitarias/fertilización con frecuencia
        for item in campana.plan_fitosanitario.filter(frecuencia_dias__isnull=False, activo=True):
            base = item.fecha_inicio or fecha_ref
            while base < today:
                base += datetime.timedelta(days=item.frecuencia_dias)
            objetivo_txt = item.objetivo.nombre if item.objetivo else ''
            tipo = 'fertilizacion' if 'fertili' in objetivo_txt.lower() or 'biol' in item.producto.nombre.lower() else 'control'
            CampanaAlerta.objects.create(
                campana=campana, tipo=tipo,
                titulo=f'Aplicación: {item.producto.nombre}',
                descripcion=f'Etapa: {item.get_etapa_display()}. Aplicar cada {item.frecuencia_dias} días.',
                fecha_programada=base,
                prioridad='media',
            )
            nuevas.append(tipo)

        # 5. Labores programadas próximas (hasta 5)
        for labor in campana.labores.filter(estado='programada', fecha_programada__gte=today).order_by('fecha_programada')[:5]:
            CampanaAlerta.objects.create(
                campana=campana, tipo='labor',
                titulo=f'Labor: {labor.tipo_labor.nombre}',
                descripcion=f'Etapa: {labor.etapa or "sin etapa"}. {labor.descripcion or ""}',
                fecha_programada=labor.fecha_programada,
                prioridad='baja',
            )
            nuevas.append('labor')

        alertas = CampanaAlerta.objects.filter(campana=campana)
        return Response({
            'generadas': len(nuevas),
            'tipos': list(set(nuevas)),
            'alertas': CampanaAlertaSerializer(alertas, many=True).data,
        })
