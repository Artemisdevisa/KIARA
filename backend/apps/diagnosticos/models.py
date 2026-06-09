from django.db import models


class Diagnostico(models.Model):
    METODO_CHOICES = [('formulario', 'Formulario guiado'), ('imagen', 'Análisis por imagen')]
    SEVERIDAD_CHOICES = [('leve', 'Leve'), ('moderado', 'Moderado'), ('grave', 'Grave')]

    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.CASCADE,
        related_name='diagnosticos',
        verbose_name='Cultivo'
    )
    campana = models.ForeignKey(
        'campanas.Campana',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='diagnosticos',
        verbose_name='Campaña'
    )
    parte_afectada = models.CharField(max_length=100, verbose_name='Parte afectada')
    sintomas = models.JSONField(default=list, blank=True, verbose_name='Síntomas seleccionados')
    diagnostico_probable = models.CharField(max_length=300, verbose_name='Diagnóstico probable')
    causa_probable = models.TextField(verbose_name='Causa probable')
    recomendacion = models.TextField(verbose_name='Recomendación de manejo orgánico')
    severidad = models.CharField(
        max_length=20, choices=SEVERIDAD_CHOICES, default='moderado',
        blank=True, verbose_name='Severidad'
    )
    acciones_preventivas = models.JSONField(default=list, blank=True, verbose_name='Acciones preventivas')
    metodo = models.CharField(
        max_length=20, choices=METODO_CHOICES, default='formulario',
        verbose_name='Método de diagnóstico'
    )
    imagen = models.ImageField(
        upload_to='diagnosticos/', null=True, blank=True, verbose_name='Imagen del cultivo'
    )
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha del diagnóstico')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Diagnóstico Fitosanitario'
        verbose_name_plural = 'Diagnósticos Fitosanitarios'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.diagnostico_probable} - {self.cultivo.nombre}'
