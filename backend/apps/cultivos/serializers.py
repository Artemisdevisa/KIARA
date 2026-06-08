from rest_framework import serializers
from .models import Cultivo


class CultivoSerializer(serializers.ModelSerializer):
    biohuerto_nombre   = serializers.CharField(source='biohuerto.nombre', read_only=True)
    etapa_display      = serializers.CharField(source='get_etapa_display', read_only=True)
    estado_display     = serializers.CharField(source='get_estado_display', read_only=True)
    tipo_ciclo_display = serializers.CharField(source='get_tipo_ciclo_display', read_only=True)
    dias_para_cosecha  = serializers.SerializerMethodField()

    class Meta:
        model  = Cultivo
        fields = [
            'id', 'biohuerto', 'biohuerto_nombre', 'nombre', 'tipo_ciclo', 'tipo_ciclo_display',
            'fecha_siembra', 'etapa', 'etapa_display', 'cantidad', 'unidad',
            'fecha_estimada_cosecha', 'notas', 'estado', 'estado_display',
            'dias_para_cosecha', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_dias_para_cosecha(self, obj):
        from datetime import date
        if obj.fecha_estimada_cosecha:
            return (obj.fecha_estimada_cosecha - date.today()).days
        return None
