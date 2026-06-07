from rest_framework import serializers
from .models import Cosecha


class CosechaSerializer(serializers.ModelSerializer):
    biohuerto_nombre = serializers.CharField(source='biohuerto.nombre', read_only=True)
    productor_nombre = serializers.CharField(source='biohuerto.productor.get_full_name', read_only=True)
    unidad_display = serializers.CharField(source='get_unidad_display', read_only=True)
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Cosecha
        fields = [
            'id', 'biohuerto', 'biohuerto_nombre', 'productor_nombre', 'cultivo',
            'nombre_producto', 'foto', 'foto_url', 'cantidad', 'unidad', 'unidad_display',
            'precio', 'fecha_cosecha', 'contacto', 'estado', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
        return None
