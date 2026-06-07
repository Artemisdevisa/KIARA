from django.db import models


class Alerta(models.Model):
    TIPO_CHOICES = [
        ('riego', 'Riego'),
        ('fertilizacion', 'Fertilización orgánica'),
        ('control', 'Control preventivo'),
        ('cosecha', 'Cosecha'),
        ('rotacion', 'Rotación de cultivos'),
        ('otro', 'Otro'),
    ]
    PRIORIDAD_CHOICES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]

    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.CASCADE,
        related_name='alertas',
        verbose_name='Cultivo'
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name='Tipo de alerta')
    fecha_programada = models.DateTimeField(verbose_name='Fecha y hora programada')
    descripcion = models.TextField(blank=True, verbose_name='Descripción o nota')
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='media', verbose_name='Prioridad')
    completada = models.BooleanField(default=False, verbose_name='Completada')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        ordering = ['completada', 'fecha_programada']

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.cultivo.nombre}'
