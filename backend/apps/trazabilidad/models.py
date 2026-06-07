from django.db import models


class PracticaSostenible(models.Model):
    TIPO_CHOICES = [
        ('compost', 'Uso de compost'),
        ('biol', 'Uso de biol'),
        ('sin_agroquimicos', 'Sin agroquímicos'),
        ('riego_eficiente', 'Riego eficiente'),
        ('mulching', 'Mulching'),
        ('control_biologico', 'Control biológico'),
        ('otro', 'Otro'),
    ]

    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.CASCADE,
        related_name='practicas',
        verbose_name='Cultivo'
    )
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, verbose_name='Tipo de práctica')
    fecha = models.DateField(verbose_name='Fecha de aplicación')
    descripcion = models.TextField(blank=True, verbose_name='Descripción breve')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Práctica Sostenible'
        verbose_name_plural = 'Prácticas Sostenibles'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.cultivo.nombre}'


class Costo(models.Model):
    CONCEPTO_CHOICES = [
        ('insumos', 'Insumos'),
        ('agua', 'Agua'),
        ('semillas', 'Semillas'),
        ('mano_obra', 'Mano de obra'),
        ('herramientas', 'Herramientas'),
        ('otro', 'Otro'),
    ]

    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.CASCADE,
        related_name='costos',
        verbose_name='Cultivo'
    )
    concepto = models.CharField(max_length=20, choices=CONCEPTO_CHOICES, verbose_name='Concepto')
    monto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Monto (S/)')
    fecha = models.DateField(verbose_name='Fecha')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Costo de Producción'
        verbose_name_plural = 'Costos de Producción'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_concepto_display()} S/{self.monto} - {self.cultivo.nombre}'
