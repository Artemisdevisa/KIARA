import json
from rest_framework import serializers
from .models import Diagnostico


class JSONStringField(serializers.Field):
    """Acepta lista Python O string JSON (necesario para multipart/form-data)."""
    def to_representation(self, value):
        return value if isinstance(value, list) else []

    def to_internal_value(self, data):
        if isinstance(data, list):
            return data
        if isinstance(data, str):
            try:
                return json.loads(data)
            except Exception:
                return []
        return []


class DiagnosticoSerializer(serializers.ModelSerializer):
    # Variedad
    variedad_nombre  = serializers.SerializerMethodField()
    variedad_cultivo = serializers.SerializerMethodField()
    variedad_str     = serializers.SerializerMethodField()

    # Campaña
    campana_codigo = serializers.CharField(source='campana.codigo', read_only=True, allow_null=True)

    # Productor
    productor_nombre = serializers.SerializerMethodField()

    # Fecha + hora legible
    fecha_hora = serializers.SerializerMethodField()

    # Imagen
    imagen_url = serializers.SerializerMethodField()

    # Campos multipart-safe
    sintomas             = JSONStringField(default=list)
    acciones_preventivas = JSONStringField(default=list)

    class Meta:
        model  = Diagnostico
        fields = [
            'id',
            'productor', 'productor_nombre',
            'variedad', 'variedad_nombre', 'variedad_cultivo', 'variedad_str',
            'campana', 'campana_codigo',
            'parte_afectada', 'sintomas',
            'diagnostico_probable', 'causa_probable', 'recomendacion',
            'severidad', 'acciones_preventivas',
            'metodo', 'imagen', 'imagen_url',
            'fecha', 'fecha_hora', 'created_at',
        ]
        read_only_fields = ['id', 'productor', 'fecha', 'created_at']

    def get_fecha_hora(self, obj):
        if not obj.created_at:
            return obj.fecha
        from django.utils import timezone
        local = timezone.localtime(obj.created_at)
        return local.strftime('%d/%m/%Y %H:%M')

    def get_variedad_nombre(self, obj):
        return obj.variedad.nombre if obj.variedad else None

    def get_variedad_cultivo(self, obj):
        return obj.variedad.cultivo if obj.variedad else None

    def get_variedad_str(self, obj):
        return str(obj.variedad) if obj.variedad else None

    def get_productor_nombre(self, obj):
        u = obj.productor
        nombre = f'{u.first_name} {u.last_name}'.strip()
        return nombre or u.username

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.imagen.url)
        return obj.imagen.url
