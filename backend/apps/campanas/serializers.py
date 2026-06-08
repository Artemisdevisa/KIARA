from rest_framework import serializers
from .models import (
    Variedad, ProductoAgricola, TipoLabor,
    UnidadMedida, Plaga, Objetivo, Condicion,
    Campana, LaborCampana, ItemFitosanitario,
    RegistroAplicacion, PlanRiego, RegistroRiego,
    PresupuestoItem, PracticaSostenible, PlantillaProducto, PlantillaLabor,
)


class VariedadSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Variedad
        fields = '__all__'


class ProductoAgricolaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    class Meta:
        model  = ProductoAgricola
        fields = '__all__'


class TipoLaborSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    class Meta:
        model  = TipoLabor
        fields = '__all__'


class UnidadMedidaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    class Meta:
        model  = UnidadMedida
        fields = '__all__'


class PlagaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    class Meta:
        model  = Plaga
        fields = '__all__'


class ObjetivoSerializer(serializers.ModelSerializer):
    tipo_display  = serializers.CharField(source='get_tipo_display', read_only=True)
    plaga_nombre  = serializers.CharField(source='plaga.nombre', read_only=True, allow_null=True)
    class Meta:
        model  = Objetivo
        fields = '__all__'


class CondicionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Condicion
        fields = '__all__'


class LaborCampanaSerializer(serializers.ModelSerializer):
    tipo_labor_nombre  = serializers.CharField(source='tipo_labor.nombre', read_only=True)
    tipo_labor_codigo  = serializers.CharField(source='tipo_labor.codigo', read_only=True)
    tipo_labor_unidad  = serializers.CharField(source='tipo_labor.unidad_default', read_only=True)
    estado_display     = serializers.CharField(source='get_estado_display', read_only=True)
    etapa_display      = serializers.CharField(source='get_etapa_display', read_only=True)
    costo_programado   = serializers.SerializerMethodField()
    costo_ejecutado    = serializers.SerializerMethodField()

    class Meta:
        model  = LaborCampana
        fields = '__all__'
        read_only_fields = ['campana']

    def get_costo_programado(self, obj):
        return float(obj.cantidad_programada * obj.costo_unitario)

    def get_costo_ejecutado(self, obj):
        if obj.cantidad_ejecutada is not None:
            return float(obj.cantidad_ejecutada * obj.costo_unitario)
        return None


class ItemFitosanitarioSerializer(serializers.ModelSerializer):
    producto_nombre  = serializers.CharField(source='producto.nombre',         read_only=True)
    producto_unidad  = serializers.CharField(source='producto.unidad',         read_only=True)
    producto_precio  = serializers.DecimalField(source='producto.precio_unitario', max_digits=10, decimal_places=2, read_only=True)
    objetivo_nombre  = serializers.CharField(source='objetivo.nombre',         read_only=True, allow_null=True)
    plaga_nombre     = serializers.CharField(source='plaga.nombre',            read_only=True, allow_null=True)
    unidad_codigo    = serializers.CharField(source='unidad.codigo',           read_only=True, allow_null=True)
    condicion_nombre = serializers.CharField(source='condicion.nombre',        read_only=True, allow_null=True)
    etapa_display    = serializers.CharField(source='get_etapa_display',       read_only=True)

    class Meta:
        model  = ItemFitosanitario
        fields = '__all__'
        read_only_fields = ['campana']


class RegistroAplicacionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_unidad = serializers.CharField(source='producto.unidad', read_only=True)

    class Meta:
        model  = RegistroAplicacion
        fields = '__all__'
        read_only_fields = ['campana']


class PlanRiegoSerializer(serializers.ModelSerializer):
    metodo_display       = serializers.CharField(source='get_metodo_display',   read_only=True)
    fertilizante_nombre  = serializers.CharField(source='fertilizante.nombre', read_only=True, allow_null=True)

    class Meta:
        model  = PlanRiego
        fields = '__all__'
        read_only_fields = ['campana']


class RegistroRiegoSerializer(serializers.ModelSerializer):
    fertilizante_nombre = serializers.CharField(source='fertilizante.nombre', read_only=True, allow_null=True)
    plan_nombre         = serializers.CharField(source='plan.nombre',         read_only=True, allow_null=True)
    costo_total         = serializers.SerializerMethodField()

    class Meta:
        model  = RegistroRiego
        fields = '__all__'
        read_only_fields = ['campana']

    def get_costo_total(self, obj):
        total = float(obj.costo_agua)
        if obj.fertilizante and obj.dosis_fertilizante:
            total += float(obj.dosis_fertilizante * obj.fertilizante.precio_unitario)
        return round(total, 2)


class PresupuestoItemSerializer(serializers.ModelSerializer):
    categoria_display   = serializers.CharField(source='get_categoria_display', read_only=True)
    monto_presupuestado = serializers.SerializerMethodField()
    varianza            = serializers.SerializerMethodField()

    class Meta:
        model  = PresupuestoItem
        fields = '__all__'
        read_only_fields = ['campana']

    def get_monto_presupuestado(self, obj):
        return float(obj.monto_presupuestado)

    def get_varianza(self, obj):
        return float(obj.varianza)


class PracticaSostenibleSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model  = PracticaSostenible
        fields = '__all__'
        read_only_fields = ['campana']


class PlantillaProductoSerializer(serializers.ModelSerializer):
    producto_nombre  = serializers.CharField(source='producto.nombre',   read_only=True)
    producto_unidad  = serializers.CharField(source='producto.unidad',   read_only=True)
    producto_tipo    = serializers.CharField(source='producto.tipo',     read_only=True)
    objetivo_nombre  = serializers.CharField(source='objetivo.nombre',   read_only=True, allow_null=True)
    plaga_nombre     = serializers.CharField(source='plaga.nombre',      read_only=True, allow_null=True)
    unidad_codigo    = serializers.CharField(source='unidad.codigo',     read_only=True, allow_null=True)
    condicion_nombre = serializers.CharField(source='condicion.nombre',  read_only=True, allow_null=True)

    class Meta:
        model  = PlantillaProducto
        fields = '__all__'
        read_only_fields = ['variedad']


class PlantillaLaborSerializer(serializers.ModelSerializer):
    tipo_labor_nombre  = serializers.CharField(source='tipo_labor.nombre',             read_only=True)
    tipo_labor_unidad  = serializers.CharField(source='tipo_labor.unidad_default',     read_only=True)
    costo_unitario     = serializers.DecimalField(source='tipo_labor.costo_unitario_default', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = PlantillaLabor
        fields = '__all__'
        read_only_fields = ['variedad']


class CampanaSerializer(serializers.ModelSerializer):
    variedad_str       = serializers.CharField(source='variedad.__str__', read_only=True)
    biohuerto_nombre   = serializers.CharField(source='biohuerto.nombre', read_only=True)
    estado_display     = serializers.CharField(source='get_estado_display', read_only=True)
    labores_count      = serializers.SerializerMethodField()
    labores_pendientes = serializers.SerializerMethodField()

    class Meta:
        model  = Campana
        fields = '__all__'
        read_only_fields = ['id', 'codigo', 'created_at', 'updated_at']

    def get_labores_count(self, obj):
        return obj.labores.count()

    def get_labores_pendientes(self, obj):
        return obj.labores.filter(estado='programada').count()
