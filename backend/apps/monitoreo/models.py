from django.db import models


class MonitoreoRegistro(models.Model):
    LUMINOSIDAD_CHOICES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]

    biohuerto = models.ForeignKey(
        'biohuertos.Biohuerto',
        on_delete=models.CASCADE,
        related_name='monitoreos',
        verbose_name='Biohuerto'
    )
    fecha = models.DateField(verbose_name='Fecha del registro')
    humedad = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Humedad (%)')
    temperatura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Temperatura (°C)')
    luminosidad = models.CharField(max_length=10, choices=LUMINOSIDAD_CHOICES, blank=True, verbose_name='Luminosidad')
    incidencias = models.TextField(blank=True, verbose_name='Incidencias o novedades del día')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Registro de Monitoreo'
        verbose_name_plural = 'Registros de Monitoreo'
        ordering = ['-fecha', '-created_at']

    def __str__(self):
        return f'Monitoreo {self.biohuerto.nombre} - {self.fecha}'
