from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegistroView, LoginView, PerfilView, UsuarioListCreateView, UsuarioDetailView

urlpatterns = [
    path('register/', RegistroView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', PerfilView.as_view(), name='perfil'),
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuarios-list'),
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='usuarios-detail'),
]
