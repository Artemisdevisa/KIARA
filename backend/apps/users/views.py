import re
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegistroSerializer, PerfilSerializer, CustomTokenSerializer, UsuarioAdminSerializer
from .models import User


def _generate_username(email):
    base = re.sub(r'[^a-z0-9_]', '', email.split('@')[0].lower()) or 'user'
    username, i = base, 1
    while User.objects.filter(username=username).exists():
        username = f'{base}{i}'
        i += 1
    return username


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import requests as http_requests
        from decouple import config

        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token requerido.'}, status=400)

        # Verify access_token with Google userinfo endpoint
        r = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'},
            timeout=5,
        )
        if r.status_code != 200:
            return Response({'detail': 'Token de Google inválido.'}, status=400)

        idinfo     = r.json()
        email      = idinfo.get('email', '')
        first_name = idinfo.get('given_name', '')
        last_name  = idinfo.get('family_name', '')

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username':   _generate_username(email),
                'first_name': first_name,
                'last_name':  last_name,
                'rol':        'cliente',
                'roles':      ['cliente'],
            }
        )
        if not created:
            changed = False
            if not user.first_name:
                user.first_name = first_name
                user.last_name  = last_name
                changed = True
            if not user.roles:
                user.roles = [user.rol or 'cliente']
                changed = True
            if changed:
                user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    PerfilSerializer(user).data,
        })


class RegistroView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class PerfilView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UsuarioListCreateView(generics.ListCreateAPIView):
    serializer_class = UsuarioAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        rol = self.request.query_params.get('rol')
        search = self.request.query_params.get('search')
        if rol:
            qs = qs.filter(rol=rol)
        if search:
            qs = qs.filter(username__icontains=search) | qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search) | qs.filter(email__icontains=search)
        return qs

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UsuarioAdminSerializer
    permission_classes = [permissions.IsAuthenticated]
