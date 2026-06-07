from rest_framework import generics, permissions
from .models import Biohuerto
from .serializers import BiohuertSerializer


class BiohuertosListCreate(generics.ListCreateAPIView):
    serializer_class = BiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Biohuerto.objects.filter(productor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(productor=self.request.user)


class BiohuertosDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Biohuerto.objects.filter(productor=self.request.user)
