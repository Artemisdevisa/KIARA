from django.db import models


class Diagnostico(models.Model):
    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.CASCADE,
        related_name='diagnosticos',
        verbose_name='Cultivo'
    )
    parte_afectada = models.CharField(max_length=100, verbose_name='Parte afectada')
    sintomas = models.JSONField(default=list, verbose_name='Síntomas seleccionados')
    diagnostico_probable = models.CharField(max_length=300, verbose_name='Diagnóstico probable')
    causa_probable = models.TextField(verbose_name='Causa probable')
    recomendacion = models.TextField(verbose_name='Recomendación de manejo orgánico')
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha del diagnóstico')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Diagnóstico Fitosanitario'
        verbose_name_plural = 'Diagnósticos Fitosanitarios'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.diagnostico_probable} - {self.cultivo.nombre}'
