from rest_framework import serializers
from .models import Diagnostico


class DiagnosticoSerializer(serializers.ModelSerializer):
    cultivo_nombre = serializers.CharField(source='cultivo.nombre', read_only=True)

    class Meta:
        model = Diagnostico
        fields = [
            'id', 'cultivo', 'cultivo_nombre', 'parte_afectada', 'sintomas',
            'diagnostico_probable', 'causa_probable', 'recomendacion',
            'severidad', 'acciones_preventivas', 'metodo', 'imagen',
            'fecha', 'created_at',
        ]
        read_only_fields = ['id', 'fecha', 'created_at']
