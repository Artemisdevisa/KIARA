from django.db import models


class Cultivo(models.Model):
    ETAPA_CHOICES = [
        ('germinacion', 'Germinación'),
        ('crecimiento', 'Crecimiento'),
        ('floracion', 'Floración'),
        ('cosecha', 'Cosecha'),
    ]
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('cosechado', 'Cosechado'),
        ('perdido', 'Perdido'),
    ]

    biohuerto = models.ForeignKey(
        'biohuertos.Biohuerto',
        on_delete=models.CASCADE,
        related_name='cultivos',
        verbose_name='Biohuerto'
    )
    nombre = models.CharField(max_length=200, verbose_name='Nombre del cultivo')
    fecha_siembra = models.DateField(verbose_name='Fecha de siembra')
    etapa = models.CharField(max_length=20, choices=ETAPA_CHOICES, default='germinacion', verbose_name='Etapa actual')
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad / Área sembrada')
    unidad = models.CharField(max_length=50, default='m²', verbose_name='Unidad')
    fecha_estimada_cosecha = models.DateField(verbose_name='Fecha estimada de cosecha')
    notas = models.TextField(blank=True, verbose_name='Notas adicionales')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo', verbose_name='Estado')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cultivo'
        verbose_name_plural = 'Cultivos'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre} - {self.biohuerto.nombre}'
