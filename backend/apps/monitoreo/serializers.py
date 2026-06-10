from rest_framework import serializers
from .models import MonitoreoRegistro


class MonitoreoRegistroSerializer(serializers.ModelSerializer):
    biohuerto_nombre    = serializers.CharField(source='biohuerto.nombre', read_only=True)
    luminosidad_display = serializers.CharField(source='get_luminosidad_display', read_only=True)

    class Meta:
        model = MonitoreoRegistro
        fields = [
            'id', 'biohuerto', 'biohuerto_nombre', 'fecha', 'humedad',
            'temperatura', 'luminosidad', 'luminosidad_display', 'incidencias', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        biohuerto = data.get('biohuerto')
        fecha     = data.get('fecha')
        if biohuerto and fecha:
            qs = MonitoreoRegistro.objects.filter(biohuerto=biohuerto, fecha=fecha)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'fecha': f'Ya existe un registro de monitoreo para {biohuerto.nombre} el {fecha}. Solo se permite uno por día.'}
                )
        return data
