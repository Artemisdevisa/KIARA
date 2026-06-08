from rest_framework import serializers
from .models import Biohuerto, DocumentoBiohuerto


class DocumentoBiohuertSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model  = DocumentoBiohuerto
        fields = [
            'id', 'biohuerto', 'tipo', 'nombre', 'archivo', 'archivo_url',
            'fecha_emision', 'fecha_vencimiento', 'created_at',
        ]
        read_only_fields = ['id', 'biohuerto', 'archivo_url', 'created_at']

    def get_archivo_url(self, obj):
        request = self.context.get('request')
        if obj.archivo and request:
            return request.build_absolute_uri(obj.archivo.url)
        return None


class BiohuertSerializer(serializers.ModelSerializer):
    productor_nombre = serializers.CharField(source='productor.get_full_name', read_only=True)
    cultivos_count   = serializers.SerializerMethodField()
    documentos       = DocumentoBiohuertSerializer(many=True, read_only=True)

    class Meta:
        model  = Biohuerto
        fields = [
            'id', 'nombre', 'codigo', 'ubicacion', 'area', 'descripcion',
            'activo', 'departamento', 'provincia', 'distrito', 'latitud', 'longitud',
            'productor_nombre', 'cultivos_count', 'documentos', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_cultivos_count(self, obj):
        return obj.cultivos.filter(estado='activo').count()
