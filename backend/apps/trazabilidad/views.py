from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import PracticaSostenible, Costo
from .serializers import PracticaSostenibleSerializer, CostoSerializer


class PracticasListCreate(generics.ListCreateAPIView):
    serializer_class = PracticaSostenibleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = PracticaSostenible.objects.filter(cultivo__biohuerto__productor=self.request.user)
        cultivo_id = self.request.query_params.get('cultivo')
        if cultivo_id:
            qs = qs.filter(cultivo_id=cultivo_id)
        return qs


class PracticaDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PracticaSostenibleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PracticaSostenible.objects.filter(cultivo__biohuerto__productor=self.request.user)


class CostosListCreate(generics.ListCreateAPIView):
    serializer_class = CostoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Costo.objects.filter(cultivo__biohuerto__productor=self.request.user)
        cultivo_id = self.request.query_params.get('cultivo')
        if cultivo_id:
            qs = qs.filter(cultivo_id=cultivo_id)
        return qs


class CostoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CostoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Costo.objects.filter(cultivo__biohuerto__productor=self.request.user)


class ResumenCultivoView(APIView):
    """Resumen de costos e ingresos por cultivo."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, cultivo_id):
        from apps.cultivos.models import Cultivo
        from apps.cosechas.models import Cosecha

        try:
            cultivo = Cultivo.objects.get(pk=cultivo_id, biohuerto__productor=request.user)
        except Cultivo.DoesNotExist:
            return Response({'detail': 'Cultivo no encontrado.'}, status=404)

        total_costos = Costo.objects.filter(cultivo=cultivo).aggregate(total=Sum('monto'))['total'] or 0
        cosechas = Cosecha.objects.filter(cultivo=cultivo)
        total_ingresos = sum(c.precio * c.cantidad for c in cosechas)
        ganancia_estimada = float(total_ingresos) - float(total_costos)

        costos_por_concepto = {}
        for costo in Costo.objects.filter(cultivo=cultivo):
            concepto = costo.get_concepto_display()
            costos_por_concepto[concepto] = float(costos_por_concepto.get(concepto, 0)) + float(costo.monto)

        return Response({
            'cultivo_id': cultivo_id,
            'cultivo_nombre': cultivo.nombre,
            'total_costos': float(total_costos),
            'total_ingresos': float(total_ingresos),
            'ganancia_estimada': ganancia_estimada,
            'costos_por_concepto': costos_por_concepto,
        })
