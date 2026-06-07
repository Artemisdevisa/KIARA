from rest_framework import serializers
from .models import PracticaSostenible, Costo


class PracticaSostenibleSerializer(serializers.ModelSerializer):
    cultivo_nombre = serializers.CharField(source='cultivo.nombre', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = PracticaSostenible
        fields = ['id', 'cultivo', 'cultivo_nombre', 'tipo', 'tipo_display', 'fecha', 'descripcion', 'created_at']
        read_only_fields = ['id', 'created_at']


class CostoSerializer(serializers.ModelSerializer):
    cultivo_nombre = serializers.CharField(source='cultivo.nombre', read_only=True)
    concepto_display = serializers.CharField(source='get_concepto_display', read_only=True)

    class Meta:
        model = Costo
        fields = ['id', 'cultivo', 'cultivo_nombre', 'concepto', 'concepto_display', 'monto', 'fecha', 'descripcion', 'created_at']
        read_only_fields = ['id', 'created_at']
