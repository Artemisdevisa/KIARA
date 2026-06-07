from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Alerta
from .serializers import AlertaSerializer


class AlertasListCreate(generics.ListCreateAPIView):
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Alerta.objects.filter(cultivo__biohuerto__productor=self.request.user)
        cultivo_id = self.request.query_params.get('cultivo')
        completada = self.request.query_params.get('completada')
        if cultivo_id:
            qs = qs.filter(cultivo_id=cultivo_id)
        if completada is not None:
            qs = qs.filter(completada=completada.lower() == 'true')
        return qs


class AlertasDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alerta.objects.filter(cultivo__biohuerto__productor=self.request.user)


class AlertaCompletarView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            alerta = Alerta.objects.get(pk=pk, cultivo__biohuerto__productor=request.user)
        except Alerta.DoesNotExist:
            return Response({'detail': 'Alerta no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        alerta.completada = True
        alerta.save()
        return Response(AlertaSerializer(alerta).data)
