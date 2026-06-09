from rest_framework import serializers
from .models import Biohuerto, BiohuertMiembro, DocumentoBiohuerto


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


class BiohuertMiembroSerializer(serializers.ModelSerializer):
    usuario_nombre   = serializers.SerializerMethodField()
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email    = serializers.CharField(source='usuario.email', read_only=True)
    rol_display      = serializers.CharField(source='get_rol_display', read_only=True)

    class Meta:
        model  = BiohuertMiembro
        fields = '__all__'
        read_only_fields = ['biohuerto', 'created_at']

    def get_usuario_nombre(self, obj):
        full = obj.usuario.get_full_name()
        return full if full.strip() else obj.usuario.username


class BiohuertSerializer(serializers.ModelSerializer):
    productor_nombre = serializers.CharField(source='productor.get_full_name', read_only=True)
    cultivos_count   = serializers.SerializerMethodField()
    miembros_count   = serializers.SerializerMethodField()
    documentos       = DocumentoBiohuertSerializer(many=True, read_only=True)

    class Meta:
        model  = Biohuerto
        fields = [
            'id', 'nombre', 'codigo', 'ubicacion', 'area', 'descripcion',
            'activo', 'departamento', 'provincia', 'distrito', 'latitud', 'longitud',
            'productor_nombre', 'cultivos_count', 'miembros_count', 'documentos',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_cultivos_count(self, obj):
        return obj.cultivos.filter(estado='activo').count()

    def get_miembros_count(self, obj):
        return obj.miembros.count()


class BiohuertAdminSerializer(serializers.ModelSerializer):
    productor_nombre   = serializers.SerializerMethodField()
    productor_username = serializers.CharField(source='productor.username', read_only=True)
    miembros_count     = serializers.SerializerMethodField()

    class Meta:
        model  = Biohuerto
        fields = ['id', 'nombre', 'codigo', 'ubicacion', 'area', 'activo',
                  'productor_nombre', 'productor_username', 'miembros_count', 'created_at']

    def get_productor_nombre(self, obj):
        full = obj.productor.get_full_name()
        return full if full.strip() else obj.productor.username

    def get_miembros_count(self, obj):
        return obj.miembros.count()
