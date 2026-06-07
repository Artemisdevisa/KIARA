from rest_framework import serializers
from .models import Alerta


class AlertaSerializer(serializers.ModelSerializer):
    cultivo_nombre = serializers.CharField(source='cultivo.nombre', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    vencida = serializers.SerializerMethodField()

    class Meta:
        model = Alerta
        fields = [
            'id', 'cultivo', 'cultivo_nombre', 'tipo', 'tipo_display',
            'fecha_programada', 'descripcion', 'prioridad', 'prioridad_display',
            'completada', 'vencida', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_vencida(self, obj):
        from django.utils import timezone
        return not obj.completada and obj.fecha_programada < timezone.now()
