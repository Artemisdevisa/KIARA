import json
from pathlib import Path
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Cultivo
from .serializers import CultivoSerializer


class CultivosListCreate(generics.ListCreateAPIView):
    serializer_class = CultivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Cultivo.objects.filter(biohuerto__productor=self.request.user)
        biohuerto_id = self.request.query_params.get('biohuerto')
        estado = self.request.query_params.get('estado')
        if biohuerto_id:
            qs = qs.filter(biohuerto_id=biohuerto_id)
        if estado:
            qs = qs.filter(estado=estado)
        return qs


class CultivosDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CultivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cultivo.objects.filter(biohuerto__productor=self.request.user)


class CultivosDataView(APIView):
    """Retorna la base de datos estática de recomendaciones por cultivo."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data_path = Path(__file__).resolve().parent.parent.parent / 'data' / 'cultivos_recomendaciones.json'
        with open(data_path, encoding='utf-8') as f:
            data = json.load(f)
        nombre = request.query_params.get('nombre')
        if nombre:
            cultivo = next((c for c in data if c['nombre'].lower() == nombre.lower()), None)
            if cultivo:
                return Response(cultivo)
            return Response({'detail': 'Cultivo no encontrado en la base de recomendaciones.'}, status=404)
        return Response(data)
