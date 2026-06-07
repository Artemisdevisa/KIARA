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
