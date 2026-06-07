from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROL_CHOICES = [
        ('productor', 'Productor'),
        ('consumidor', 'Consumidor'),
        ('admin', 'Administrador'),
    ]
    telefono = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='productor', verbose_name='Rol')

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.username} ({self.get_rol_display()})'
