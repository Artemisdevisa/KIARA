from rest_framework import serializers
from .models import Biohuerto


class BiohuertSerializer(serializers.ModelSerializer):
    productor_nombre = serializers.CharField(source='productor.get_full_name', read_only=True)
    cultivos_count = serializers.SerializerMethodField()

    class Meta:
        model = Biohuerto
        fields = [
            'id', 'nombre', 'codigo', 'ubicacion', 'area', 'descripcion',
            'activo', 'departamento', 'provincia', 'distrito', 'latitud', 'longitud',
            'productor_nombre', 'cultivos_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_cultivos_count(self, obj):
        return obj.cultivos.filter(estado='activo').count()
