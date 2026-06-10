from decimal import Decimal, InvalidOperation
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

    def perform_create(self, serializer):
        cosecha = serializer.save()
        if cosecha.campana and cosecha.campana.estado != 'cerrada':
            cosecha.campana.estado = 'cerrada'
            cosecha.campana.save(update_fields=['estado'])


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
        traz     = {'labores': [], 'fito': [], 'riego': []}

        if instance.campana:
            from apps.campanas.models import LaborCampana, ItemFitosanitario, PlanRiego

            for l in LaborCampana.objects.filter(campana=instance.campana, estado='ejecutada').select_related('tipo_labor'):
                traz['labores'].append({
                    'nombre':        l.tipo_labor.nombre,
                    'fecha':         str(l.fecha_ejecutada) if l.fecha_ejecutada else None,
                    'cantidad':      str(l.cantidad_ejecutada or l.cantidad_programada),
                    'unidad':        l.tipo_labor.unidad_default,
                    'es_sostenible': l.es_sostenible,
                })

            for f in ItemFitosanitario.objects.filter(campana=instance.campana, estado='aplicado').select_related('producto'):
                sostenible = f.es_sostenible or f.producto.tipo in ('biologico', 'enmienda', 'bioestimulante')
                traz['fito'].append({
                    'producto':      f.producto.nombre,
                    'producto_tipo': f.producto.tipo,
                    'es_sostenible': sostenible,
                    'fecha':         str(f.fecha_aplicada) if f.fecha_aplicada else None,
                    'dosis':         str(f.dosis),
                })

            for r in PlanRiego.objects.filter(campana=instance.campana, completado=True).select_related('fertilizante'):
                traz['riego'].append({
                    'nombre':           r.nombre,
                    'metodo':           r.get_metodo_display(),
                    'litros_por_m2':    str(r.litros_por_m2),
                    'fertilizante':     r.fertilizante.nombre if r.fertilizante else None,
                    'es_sostenible':    r.es_sostenible,
                    'metodo_eficiente': r.metodo in ('goteo', 'aspersion'),
                })

        # Indicadores derivados
        fito_sos     = [f for f in traz['fito'] if f['es_sostenible']]
        pct          = round(len(fito_sos) / len(traz['fito']) * 100) if traz['fito'] else None
        traz['indicadores'] = {
            'pct_sostenible':      pct,
            'fito_total':          len(traz['fito']),
            'fito_sostenible':     len(fito_sos),
            'riego_eficiente':     any(r['metodo_eficiente'] for r in traz['riego']),
            'ctrl_biologico':      any(f['producto_tipo'] == 'biologico' for f in fito_sos),
            'labores_sostenibles': sum(1 for l in traz['labores'] if l['es_sostenible']),
            'riego_sostenible':    sum(1 for r in traz['riego'] if r['es_sostenible']),
        }

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


class CosechaVenderView(APIView):
    """Registra una venta y descuenta del stock disponible."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            cosecha = Cosecha.objects.get(pk=pk, biohuerto__productor=request.user)
        except Cosecha.DoesNotExist:
            return Response({'detail': 'Cosecha no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if cosecha.estado == 'agotado':
            return Response({'detail': 'Esta cosecha ya está agotada.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cantidad = Decimal(str(request.data.get('cantidad', '')))
            if cantidad <= 0:
                raise ValueError()
        except (InvalidOperation, ValueError):
            return Response({'detail': 'Cantidad inválida.'}, status=status.HTTP_400_BAD_REQUEST)

        disponible = cosecha.cantidad - cosecha.cantidad_vendida
        if cantidad > disponible:
            return Response(
                {'detail': f'Solo quedan {disponible} {cosecha.get_unidad_display()} disponibles.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cosecha.cantidad_vendida += cantidad
        if cosecha.cantidad_vendida >= cosecha.cantidad:
            cosecha.estado = 'agotado'
        cosecha.save(update_fields=['cantidad_vendida', 'estado'])
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
