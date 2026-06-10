from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Cosecha, CategoriaCosecha
from .serializers import CosechaSerializer, CategoriaCosechaSerializer


class CosechasListCreate(generics.ListCreateAPIView):
    serializer_class = CosechaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Cosecha.objects.filter(biohuerto__productor=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class CosechaDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CosechaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Cosecha.objects.filter(biohuerto__productor=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class CosechaPublicaDetailView(generics.RetrieveAPIView):
    """Detalle público de cosecha + trazabilidad de campaña."""
    serializer_class   = CosechaSerializer
    permission_classes = [permissions.AllowAny]
    queryset           = Cosecha.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data     = self.get_serializer(instance).data
        traz     = {'practicas': [], 'labores': [], 'fito': []}

        if instance.campana:
            from apps.campanas.models import PracticaSostenible, LaborCampana, ItemFitosanitario
            for p in PracticaSostenible.objects.filter(campana=instance.campana):
                traz['practicas'].append({
                    'tipo_display': p.get_tipo_display(), 'descripcion': p.descripcion,
                    'fecha': str(p.fecha),
                    'cantidad': str(p.cantidad) if p.cantidad else None, 'unidad': p.unidad,
                })
            for l in LaborCampana.objects.filter(campana=instance.campana, estado='ejecutada').select_related('tipo_labor'):
                traz['labores'].append({
                    'nombre': l.tipo_labor.nombre,
                    'fecha': str(l.fecha_ejecutada) if l.fecha_ejecutada else None,
                    'cantidad': str(l.cantidad_ejecutada or l.cantidad_programada),
                    'unidad': l.tipo_labor.unidad_default,
                })
            for f in ItemFitosanitario.objects.filter(campana=instance.campana, estado='aplicado').select_related('producto'):
                traz['fito'].append({
                    'producto': f.producto.nombre, 'es_sostenible': f.es_sostenible,
                    'fecha': str(f.fecha_aplicada) if f.fecha_aplicada else None,
                    'dosis': str(f.dosis),
                })

        data['trazabilidad'] = traz
        return Response(data)


class CategoriasPublicasView(generics.ListAPIView):
    """Devuelve todas las categorías con sus tipos. Sin autenticación."""
    permission_classes = [permissions.AllowAny]
    serializer_class   = CategoriaCosechaSerializer
    queryset           = CategoriaCosecha.objects.prefetch_related('tipos').all()


class CosechaAgotarView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            cosecha = Cosecha.objects.get(pk=pk, biohuerto__productor=request.user)
        except Cosecha.DoesNotExist:
            return Response({'detail': 'Cosecha no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        cosecha.estado = 'agotado'
        cosecha.save()
        return Response(CosechaSerializer(cosecha, context={'request': request}).data)


class CosechasPublicasView(generics.ListAPIView):
    """Vista pública - no requiere autenticación."""
    serializer_class = CosechaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Cosecha.objects.filter(estado='disponible')
        q = self.request.query_params.get('search') or self.request.query_params.get('producto') or self.request.query_params.get('q')
        if q:
            qs = qs.filter(nombre_producto__icontains=q)
        limit = self.request.query_params.get('limit')
        if limit and str(limit).isdigit():
            qs = qs[:int(limit)]
        return qs

    def get_serializer_context(self):
        return {'request': self.request}
