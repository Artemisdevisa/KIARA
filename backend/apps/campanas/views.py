from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
import datetime
from .models import (
    Variedad, ProductoAgricola, TipoLabor,
    UnidadMedida, Plaga, Objetivo, Condicion,
    Campana, LaborCampana, ItemFitosanitario,
    RegistroAplicacion, PlanRiego, RegistroRiego,
    PresupuestoItem, PracticaSostenible, PlantillaProducto, PlantillaLabor,
)
from .serializers import (
    VariedadSerializer, ProductoAgricolaSerializer, TipoLaborSerializer,
    UnidadMedidaSerializer, PlagaSerializer, ObjetivoSerializer, CondicionSerializer,
    CampanaSerializer, LaborCampanaSerializer, ItemFitosanitarioSerializer,
    RegistroAplicacionSerializer, PlanRiegoSerializer, RegistroRiegoSerializer,
    PresupuestoItemSerializer, PracticaSostenibleSerializer,
    PlantillaProductoSerializer, PlantillaLaborSerializer,
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
