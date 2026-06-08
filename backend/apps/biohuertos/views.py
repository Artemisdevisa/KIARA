from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Biohuerto, DocumentoBiohuerto
from .serializers import BiohuertSerializer, DocumentoBiohuertSerializer


class BiohuertosListCreate(generics.ListCreateAPIView):
    serializer_class   = BiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Biohuerto.objects.filter(productor=self.request.user)

    def perform_create(self, serializer):
        user  = self.request.user
        count = Biohuerto.objects.filter(productor=user).count() + 1
        serializer.save(productor=user, codigo=f'BH-{count:03d}')


class BiohuertosDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = BiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Biohuerto.objects.filter(productor=self.request.user)


class DocumentosListCreate(generics.ListCreateAPIView):
    serializer_class   = DocumentoBiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def _get_biohuerto(self):
        return get_object_or_404(
            Biohuerto,
            pk=self.kwargs['biohuerto_pk'],
            productor=self.request.user,
        )

    def get_queryset(self):
        return DocumentoBiohuerto.objects.filter(biohuerto=self._get_biohuerto())

    def perform_create(self, serializer):
        serializer.save(biohuerto=self._get_biohuerto())


class DocumentoDetail(generics.DestroyAPIView):
    serializer_class   = DocumentoBiohuertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentoBiohuerto.objects.filter(biohuerto__productor=self.request.user)
