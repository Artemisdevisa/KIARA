from django.db import models
from django.conf import settings


class Biohuerto(models.Model):
    productor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='biohuertos',
        verbose_name='Productor'
    )
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    codigo = models.CharField(max_length=50, blank=True, verbose_name='Código')
    ubicacion = models.TextField(verbose_name='Ubicación de referencia')
    latitud   = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Latitud')
    longitud  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Longitud')
    area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Área (m²)')
    descripcion = models.TextField(blank=True, verbose_name='Descripción general')
    activo       = models.BooleanField(default=True)
    departamento = models.CharField(max_length=100, blank=True, verbose_name='Departamento')
    provincia    = models.CharField(max_length=100, blank=True, verbose_name='Provincia')
    distrito     = models.CharField(max_length=100, blank=True, verbose_name='Distrito')
    latitud      = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Latitud')
    longitud     = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name='Longitud')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Biohuerto'
        verbose_name_plural = 'Biohuertos'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre} - {self.productor.username}'
