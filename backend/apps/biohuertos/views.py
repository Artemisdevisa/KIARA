from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Biohuerto, BiohuertMiembro, DocumentoBiohuerto
from .serializers import (
    BiohuertSerializer, BiohuertAdminSerializer,
    BiohuertMiembroSerializer, DocumentoBiohuertSerializer,
)

User = get_user_model()


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


# ── Miembros de biohuerto ─────────────────────────────────────────

class MiembrosListCreate(generics.ListCreateAPIView):
    serializer_class   = BiohuertMiembroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_biohuerto(self):
        bh = get_object_or_404(Biohuerto, pk=self.kwargs['biohuerto_pk'])
        # El productor o cualquier miembro puede listar
        user = self.request.user
        is_owner  = bh.productor == user
        is_member = bh.miembros.filter(usuario=user).exists()
        is_admin  = getattr(user, 'rol', '') == 'admin'
        if not (is_owner or is_member or is_admin):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        return bh

    def get_queryset(self):
        return BiohuertMiembro.objects.filter(biohuerto=self._get_biohuerto())

    def perform_create(self, serializer):
        bh = get_object_or_404(Biohuerto, pk=self.kwargs['biohuerto_pk'])
        user = self.request.user
        if bh.productor != user and getattr(user, 'rol', '') != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        serializer.save(biohuerto=bh)


class MiembroDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = BiohuertMiembroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'rol', '') == 'admin':
            return BiohuertMiembro.objects.all()
        return BiohuertMiembro.objects.filter(biohuerto__productor=user)


# ── Vistas admin ─────────────────────────────────────────────────

class AdminBiohuertosListView(generics.ListAPIView):
    serializer_class   = BiohuertAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'rol', '') == 'admin':
            return Biohuerto.objects.all().select_related('productor').prefetch_related('miembros')
        return Biohuerto.objects.filter(productor=user).select_related('productor').prefetch_related('miembros')


class UsuariosListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        qs = User.objects.all()
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q))
        data = [
            {
                'id': u.id,
                'username': u.username,
                'nombre': u.get_full_name() or u.username,
                'email': u.email,
                'rol': getattr(u, 'rol', ''),
            }
            for u in qs[:50]
        ]
        return Response(data)


# ── Documentos ───────────────────────────────────────────────────

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
