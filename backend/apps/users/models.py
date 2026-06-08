from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROL_CHOICES = [
        ('cliente',   'Cliente'),
        ('productor', 'Productor'),
        ('admin',     'Administrador'),
    ]
    telefono = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    rol      = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente', verbose_name='Rol principal')
    roles    = models.JSONField(default=list, verbose_name='Roles')
    latitud  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Latitud')
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Longitud')

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.username} ({self.get_rol_display()})'
