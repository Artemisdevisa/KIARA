from django.db import models


class CategoriaCosecha(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    emoji  = models.CharField(max_length=10, default='🌱', verbose_name='Emoji')
    slug   = models.SlugField(unique=True, verbose_name='Slug')
    orden  = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['orden', 'nombre']

    def __str__(self):
        return self.nombre


class TipoCosecha(models.Model):
    categoria = models.ForeignKey(CategoriaCosecha, on_delete=models.CASCADE, related_name='tipos')
    nombre    = models.CharField(max_length=100, verbose_name='Nombre')
    slug      = models.SlugField(verbose_name='Slug')

    class Meta:
        verbose_name = 'Tipo de cosecha'
        verbose_name_plural = 'Tipos de cosecha'
        unique_together = [('categoria', 'slug')]
        ordering = ['nombre']

    def __str__(self):
        return f'{self.categoria.nombre} › {self.nombre}'


class Cosecha(models.Model):
    UNIDAD_CHOICES = [
        ('kg', 'Kilogramos'),
        ('unidades', 'Unidades'),
        ('atados', 'Atados'),
        ('cajas', 'Cajas'),
    ]
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('agotado', 'Agotado'),
    ]

    categoria = models.ForeignKey(
        'CategoriaCosecha',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='cosechas',
        verbose_name='Categoría'
    )

    biohuerto = models.ForeignKey(
        'biohuertos.Biohuerto',
        on_delete=models.CASCADE,
        related_name='cosechas',
        verbose_name='Biohuerto'
    )
    cultivo = models.ForeignKey(
        'cultivos.Cultivo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cosechas_publicadas',
        verbose_name='Cultivo'
    )
    campana = models.ForeignKey(
        'campanas.Campana',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cosechas',
        verbose_name='Campaña'
    )
    nombre_producto = models.CharField(max_length=200, verbose_name='Nombre del producto')
    foto = models.ImageField(upload_to='cosechas/', null=True, blank=True, verbose_name='Foto')
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad disponible')
    unidad = models.CharField(max_length=20, choices=UNIDAD_CHOICES, default='kg', verbose_name='Unidad')
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio referencial (S/)')
    fecha_cosecha = models.DateField(verbose_name='Fecha de cosecha')
    contacto = models.CharField(max_length=200, verbose_name='Medio de contacto (teléfono/WhatsApp)')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible', verbose_name='Estado')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cosecha Publicada'
        verbose_name_plural = 'Cosechas Publicadas'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre_producto} - {self.biohuerto.nombre}'
