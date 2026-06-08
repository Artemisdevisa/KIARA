from django.db import models


class Cultivo(models.Model):
    TIPO_CICLO_CHOICES = [
        ('anual',   'Anual'),
        ('perenne', 'Perenne'),
    ]
    ETAPA_CHOICES = [
        # Anual
        ('germinacion', 'Germinación'),
        ('crecimiento', 'Crecimiento'),
        # Perenne
        ('establecido', 'Establecido'),
        ('poda',        'Poda'),
        ('brotacion',   'Brotación'),
        # Compartidas
        ('floracion',   'Floración'),
        ('cosecha',     'Cosecha'),
    ]
    ESTADO_CHOICES = [
        ('activo',     'Activo'),
        ('cosechado',  'Cosechado'),
        ('perdido',    'Perdido'),
    ]

    biohuerto = models.ForeignKey(
        'biohuertos.Biohuerto',
        on_delete=models.CASCADE,
        related_name='cultivos',
        verbose_name='Biohuerto'
    )
    nombre                 = models.CharField(max_length=200, verbose_name='Nombre del cultivo')
    tipo_ciclo             = models.CharField(max_length=10, choices=TIPO_CICLO_CHOICES, default='anual', verbose_name='Tipo de ciclo')
    fecha_siembra          = models.DateField(null=True, blank=True, verbose_name='Fecha de siembra / plantación')
    etapa                  = models.CharField(max_length=20, choices=ETAPA_CHOICES, default='germinacion', verbose_name='Etapa actual')
    cantidad               = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad / Área')
    unidad                 = models.CharField(max_length=50, default='m²', verbose_name='Unidad')
    fecha_estimada_cosecha = models.DateField(null=True, blank=True, verbose_name='Próxima cosecha estimada')
    notas                  = models.TextField(blank=True, verbose_name='Notas adicionales')
    estado                 = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo', verbose_name='Estado')
    created_at             = models.DateTimeField(auto_now_add=True)
    updated_at             = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Cultivo'
        verbose_name_plural = 'Cultivos'
        ordering            = ['-created_at']

    def __str__(self):
        return f'{self.nombre} ({self.get_tipo_ciclo_display()}) - {self.biohuerto.nombre}'
