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
    cultivo_nombre       = serializers.CharField(source='cultivo.nombre',           read_only=True)
    biohuerto_nombre     = serializers.CharField(source='cultivo.biohuerto.nombre', read_only=True)
    campana_codigo       = serializers.CharField(source='campana.codigo',           read_only=True, allow_null=True)
    variedad_str         = serializers.SerializerMethodField()
    imagen_url           = serializers.SerializerMethodField()
    sintomas             = JSONStringField(default=list)
    acciones_preventivas = JSONStringField(default=list)

    class Meta:
        model  = Diagnostico
        fields = [
            'id',
            'cultivo', 'cultivo_nombre', 'biohuerto_nombre',
            'campana', 'campana_codigo', 'variedad_str',
            'parte_afectada', 'sintomas',
            'diagnostico_probable', 'causa_probable', 'recomendacion',
            'severidad', 'acciones_preventivas',
            'metodo', 'imagen', 'imagen_url',
            'fecha', 'created_at',
        ]
        read_only_fields = ['id', 'fecha', 'created_at']

    def get_variedad_str(self, obj):
        if obj.campana_id:
            return str(obj.campana.variedad)
        return None

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.imagen.url)
        return obj.imagen.url
