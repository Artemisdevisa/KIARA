from rest_framework import generics, permissions
from .models import MonitoreoRegistro
from .serializers import MonitoreoRegistroSerializer


class MonitoreoListCreate(generics.ListCreateAPIView):
    serializer_class = MonitoreoRegistroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = MonitoreoRegistro.objects.filter(biohuerto__productor=self.request.user)
        biohuerto_id = self.request.query_params.get('biohuerto')
        if biohuerto_id:
            qs = qs.filter(biohuerto_id=biohuerto_id)
        return qs


class MonitoreoDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MonitoreoRegistroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoreoRegistro.objects.filter(biohuerto__productor=self.request.user)
