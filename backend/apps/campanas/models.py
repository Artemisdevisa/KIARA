from django.db import models

ETAPA_CHOICES = [
    ('preparacion', 'Preparación'),
    ('germinacion', 'Germinación'),
    ('crecimiento', 'Crecimiento'),
    ('establecido', 'Establecido'),
    ('poda',        'Poda'),
    ('brotacion',   'Brotación'),
    ('floracion',   'Floración'),
    ('cosecha',     'Cosecha'),
]

FASE_CICLO = [
    ('ambos',           'Ambos ciclos'),
    ('establecimiento', 'Solo establecimiento (ciclo 1)'),
    ('produccion',      'Solo producción (ciclo 2+)'),
]


class Variedad(models.Model):
    CICLO = [('anual', 'Anual'), ('perenne', 'Perenne')]
    cultivo          = models.CharField(max_length=100, verbose_name='Cultivo macro')
    nombre           = models.CharField(max_length=100, verbose_name='Variedad')
    subtipo          = models.CharField(max_length=100, blank=True, verbose_name='Subtipo')
    tipo_ciclo       = models.CharField(max_length=10, choices=CICLO, default='anual')
    dias_ciclo       = models.IntegerField(null=True, blank=True, verbose_name='Días estimados por ciclo')
    descripcion      = models.TextField(blank=True)

    class Meta:
        ordering = ['cultivo', 'nombre']
        verbose_name_plural = 'Variedades'

    def __str__(self):
        return f'{self.cultivo} — {self.nombre}' + (f' ({self.subtipo})' if self.subtipo else '')


class ProductoAgricola(models.Model):
    TIPO = [
        ('enmienda',       'Enmienda orgánica'),
        ('biologico',      'Control biológico'),
        ('bioestimulante', 'Bioestimulante'),
        ('fertilizante',   'Fertilizante'),
        ('fitosanitario',  'Fitosanitario'),
        ('otro',           'Otro'),
    ]
    nombre          = models.CharField(max_length=200)
    tipo            = models.CharField(max_length=20, choices=TIPO, default='enmienda')
    unidad          = models.CharField(max_length=20, default='L')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    descripcion     = models.TextField(blank=True)
    activo          = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Producto agrícola'
        verbose_name_plural = 'Productos agrícolas'

    def __str__(self):
        return self.nombre


class TipoLabor(models.Model):
    TIPO = [
        ('formacion',  'Formación de planta'),
        ('poda',       'Poda'),
        ('riego',      'Riego'),
        ('aplicacion', 'Aplicación'),
        ('cosecha',    'Cosecha'),
        ('otro',       'Otro'),
    ]
    codigo                 = models.CharField(max_length=20, unique=True, blank=True)
    nombre                 = models.CharField(max_length=200)
    tipo                   = models.CharField(max_length=20, choices=TIPO, default='otro')
    unidad_default         = models.CharField(max_length=50, default='hora')
    costo_unitario_default = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    activo                 = models.BooleanField(default=True)

    class Meta:
        ordering = ['codigo']
        verbose_name = 'Tipo de labor'
        verbose_name_plural = 'Tipos de labor'

    def save(self, *args, **kwargs):
        if not self.codigo:
            n = TipoLabor.objects.count() + 1
            candidate = f'TL-{n:04d}'
            while TipoLabor.objects.filter(codigo=candidate).exists():
                n += 1
                candidate = f'TL-{n:04d}'
            self.codigo = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.codigo} — {self.nombre}'


# ── Catálogos de apoyo ────────────────────────────────────────────

class UnidadMedida(models.Model):
    TIPO = [
        ('vol_area',  'Volumen / Área'),
        ('vol_vol',   'Volumen / Volumen'),
        ('masa_area', 'Masa / Área'),
        ('masa_vol',  'Masa / Volumen'),
        ('unidades',  'Unidades'),
    ]
    codigo      = models.CharField(max_length=20, unique=True)
    nombre      = models.CharField(max_length=80)
    tipo        = models.CharField(max_length=15, choices=TIPO, default='vol_area')

    class Meta:
        ordering = ['tipo', 'codigo']
        verbose_name = 'Unidad de medida'
        verbose_name_plural = 'Unidades de medida'

    def __str__(self):
        return self.codigo


class Plaga(models.Model):
    TIPO = [
        ('insecto',  'Insecto'),
        ('acaro',    'Ácaro'),
        ('hongo',    'Hongo'),
        ('bacteria', 'Bacteria'),
        ('virus',    'Virus'),
        ('nematodo', 'Nematodo'),
        ('maleza',   'Maleza'),
        ('otro',     'Otro'),
    ]
    nombre            = models.CharField(max_length=100, unique=True)
    nombre_cientifico = models.CharField(max_length=150, blank=True)
    tipo              = models.CharField(max_length=15, choices=TIPO, default='otro')
    descripcion       = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ['tipo', 'nombre']

    def __str__(self):
        return self.nombre


class Objetivo(models.Model):
    TIPO = [
        ('control',       'Control fitosanitario'),
        ('prevencion',    'Prevención'),
        ('fertilizacion', 'Fertilización'),
        ('estimulacion',  'Bioestimulación'),
        ('otro',          'Otro'),
    ]
    nombre  = models.CharField(max_length=150, unique=True)
    tipo    = models.CharField(max_length=20, choices=TIPO, default='control')
    plaga   = models.ForeignKey(Plaga, on_delete=models.SET_NULL, null=True, blank=True, related_name='objetivos')

    class Meta:
        ordering = ['tipo', 'nombre']

    def __str__(self):
        return self.nombre


class Condicion(models.Model):
    nombre      = models.CharField(max_length=200, unique=True)
    descripcion = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


# ── Campañas ─────────────────────────────────────────────────────

class Campana(models.Model):
    ESTADO = [
        ('planificada', 'Planificada'),
        ('activa',      'Activa'),
        ('cerrada',     'Cerrada'),
        ('cancelada',   'Cancelada'),
    ]
    CICLO = [('', 'Heredar de variedad'), ('anual', 'Anual'), ('perenne', 'Perenne')]
    biohuerto             = models.ForeignKey('biohuertos.Biohuerto', on_delete=models.CASCADE, related_name='campanas')
    variedad              = models.ForeignKey(Variedad, on_delete=models.PROTECT, related_name='campanas')
    codigo                = models.CharField(max_length=30, blank=True)
    anio                  = models.IntegerField(verbose_name='Año')
    fecha_inicio          = models.DateField()
    fecha_fin             = models.DateField(null=True, blank=True)
    area                  = models.DecimalField(max_digits=10, decimal_places=2)
    unidad_area           = models.CharField(max_length=10, default='m²')
    estado                = models.CharField(max_length=15, choices=ESTADO, default='planificada')
    tipo_ciclo            = models.CharField(max_length=10, choices=CICLO, blank=True, default='', verbose_name='Tipo de ciclo')
    numero_ciclo          = models.IntegerField(default=1, verbose_name='Número de ciclo')
    campana_anterior      = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='campanas_siguientes', verbose_name='Campaña anterior')
    objetivo_cosecha      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unidad_cosecha        = models.CharField(max_length=50, blank=True)
    precio_venta_estimado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notas                 = models.TextField(blank=True)
    created_at            = models.DateTimeField(auto_now_add=True)
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-anio', '-fecha_inicio']

    def __str__(self):
        return f'{self.codigo} — {self.variedad} ({self.anio})'


class LaborCampana(models.Model):
    ESTADO = [
        ('programada', 'Programada'),
        ('ejecutada',  'Ejecutada'),
        ('cancelada',  'Cancelada'),
    ]
    campana             = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='labores')
    tipo_labor          = models.ForeignKey(TipoLabor, on_delete=models.PROTECT)
    descripcion         = models.CharField(max_length=200, blank=True)
    fecha_programada    = models.DateField()
    fecha_ejecutada     = models.DateField(null=True, blank=True)
    cantidad_programada = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_ejecutada  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    costo_unitario      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    operario            = models.CharField(max_length=100, blank=True)
    estado              = models.CharField(max_length=15, choices=ESTADO, default='programada')
    etapa               = models.CharField(max_length=15, choices=ETAPA_CHOICES, blank=True, default='')
    es_sostenible       = models.BooleanField(default=False)
    notas               = models.TextField(blank=True)

    class Meta:
        ordering = ['etapa', 'fecha_programada']


class ItemFitosanitario(models.Model):
    ESTADO = [('programado', 'Programado'), ('aplicado', 'Aplicado')]
    campana            = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='plan_fitosanitario')
    producto           = models.ForeignKey(ProductoAgricola, on_delete=models.PROTECT)
    objetivo           = models.ForeignKey(Objetivo, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    plaga              = models.ForeignKey(Plaga, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    dosis              = models.DecimalField(max_digits=10, decimal_places=3)
    unidad             = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    dias_antes_cosecha = models.IntegerField(null=True, blank=True, verbose_name='Intervalo seguridad (días)')
    condicion          = models.ForeignKey(Condicion, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    frecuencia_dias      = models.IntegerField(null=True, blank=True)
    numero_aplicaciones  = models.IntegerField(null=True, blank=True, verbose_name='Número de aplicaciones')
    fecha_inicio         = models.DateField(null=True, blank=True)
    etapa                = models.CharField(max_length=15, choices=ETAPA_CHOICES, blank=True, default='')
    estado               = models.CharField(max_length=15, choices=ESTADO, default='programado')
    fecha_aplicada     = models.DateField(null=True, blank=True)
    area_aplicada      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    operario           = models.CharField(max_length=100, blank=True)
    es_sostenible      = models.BooleanField(default=False)
    observaciones      = models.TextField(blank=True)
    activo             = models.BooleanField(default=True)

    class Meta:
        ordering = ['etapa', 'producto__nombre']


class RegistroAplicacion(models.Model):
    campana        = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='aplicaciones')
    item_plan      = models.ForeignKey(ItemFitosanitario, on_delete=models.SET_NULL, null=True, blank=True)
    producto       = models.ForeignKey(ProductoAgricola, on_delete=models.PROTECT)
    fecha          = models.DateField()
    dosis_aplicada = models.DecimalField(max_digits=10, decimal_places=3)
    area_aplicada  = models.DecimalField(max_digits=10, decimal_places=2)
    costo_total    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    operario       = models.CharField(max_length=100, blank=True)
    es_sostenible  = models.BooleanField(default=False)
    observaciones  = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha']


class PlanRiego(models.Model):
    METODO = [
        ('goteo',     'Goteo'),
        ('aspersion', 'Aspersión'),
        ('gravedad',  'Gravedad'),
        ('manual',    'Manual'),
    ]
    campana            = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='plan_riego')
    nombre             = models.CharField(max_length=200)
    metodo             = models.CharField(max_length=15, choices=METODO, default='goteo')
    litros_por_m2      = models.DecimalField(max_digits=8, decimal_places=2)
    frecuencia_dias    = models.IntegerField()
    duracion_minutos   = models.IntegerField(null=True, blank=True)
    fertilizante       = models.ForeignKey(ProductoAgricola, on_delete=models.SET_NULL, null=True, blank=True, related_name='planes_riego')
    dosis_fertilizante = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    numero_riegos      = models.IntegerField(null=True, blank=True, verbose_name='Número de riegos')
    fecha_inicio       = models.DateField(null=True, blank=True)
    fecha_fin          = models.DateField(null=True, blank=True)
    operario           = models.CharField(max_length=100, blank=True)
    costo_agua_total   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    activo             = models.BooleanField(default=True)
    completado         = models.BooleanField(default=False)
    es_sostenible      = models.BooleanField(default=False)

    class Meta:
        ordering = ['fecha_inicio', 'nombre']


class RegistroRiego(models.Model):
    campana            = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='registros_riego')
    plan               = models.ForeignKey(PlanRiego, on_delete=models.SET_NULL, null=True, blank=True)
    fecha              = models.DateField()
    litros_aplicados   = models.DecimalField(max_digits=10, decimal_places=2)
    area_regada        = models.DecimalField(max_digits=10, decimal_places=2)
    costo_agua         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fertilizante       = models.ForeignKey(ProductoAgricola, on_delete=models.SET_NULL, null=True, blank=True, related_name='registros_riego')
    dosis_fertilizante = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    operario           = models.CharField(max_length=100, blank=True)
    observaciones      = models.TextField(blank=True)
    completado         = models.BooleanField(default=False)

    class Meta:
        ordering = ['-fecha']


class PresupuestoItem(models.Model):
    CATEGORIA = [
        ('insumo',    'Insumo / Producto'),
        ('agua',      'Agua'),
        ('mano_obra', 'Mano de obra'),
        ('otro',      'Otro'),
    ]
    campana         = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='presupuesto')
    categoria       = models.CharField(max_length=15, choices=CATEGORIA, default='insumo')
    descripcion     = models.CharField(max_length=200)
    cantidad        = models.DecimalField(max_digits=10, decimal_places=2)
    unidad          = models.CharField(max_length=50)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    monto_ejecutado = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ['categoria', 'descripcion']

    @property
    def monto_presupuestado(self):
        return self.cantidad * self.precio_unitario

    @property
    def varianza(self):
        return self.monto_presupuestado - self.monto_ejecutado


class PlantillaProducto(models.Model):
    variedad           = models.ForeignKey(Variedad, on_delete=models.CASCADE, related_name='plantilla_productos')
    producto           = models.ForeignKey(ProductoAgricola, on_delete=models.PROTECT)
    objetivo           = models.ForeignKey(Objetivo, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    plaga              = models.ForeignKey(Plaga, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    dosis              = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    unidad             = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    dias_antes_cosecha = models.IntegerField(null=True, blank=True)
    frecuencia_dias    = models.IntegerField(null=True, blank=True)
    condicion          = models.ForeignKey(Condicion, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    etapa              = models.CharField(max_length=15, choices=ETAPA_CHOICES, blank=True, default='')
    semana_relativa    = models.IntegerField(null=True, blank=True, verbose_name='Semana del ciclo')
    fase               = models.CharField(max_length=20, choices=FASE_CICLO, default='ambos', verbose_name='Aplica en')

    class Meta:
        ordering = ['etapa', 'semana_relativa', 'producto__nombre']


class PlantillaLabor(models.Model):
    variedad        = models.ForeignKey(Variedad, on_delete=models.CASCADE, related_name='plantilla_labores')
    tipo_labor      = models.ForeignKey(TipoLabor, on_delete=models.PROTECT)
    cantidad        = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    semana_relativa = models.IntegerField(null=True, blank=True, verbose_name='Semana del ciclo')
    etapa           = models.CharField(max_length=15, choices=ETAPA_CHOICES, blank=True, default='')
    fase            = models.CharField(max_length=20, choices=FASE_CICLO, default='ambos', verbose_name='Aplica en')
    notas           = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['etapa', 'semana_relativa', 'tipo_labor__nombre']


class PlantillaRiego(models.Model):
    METODO = [
        ('goteo',     'Goteo'),
        ('aspersion', 'Aspersión'),
        ('gravedad',  'Gravedad'),
        ('manual',    'Manual'),
    ]
    variedad           = models.ForeignKey(Variedad, on_delete=models.CASCADE, related_name='plantilla_riegos')
    nombre             = models.CharField(max_length=200)
    metodo             = models.CharField(max_length=15, choices=METODO, default='goteo')
    litros_por_m2      = models.DecimalField(max_digits=8, decimal_places=2)
    frecuencia_dias    = models.IntegerField()
    duracion_minutos   = models.IntegerField(null=True, blank=True)
    fertilizante       = models.ForeignKey(ProductoAgricola, on_delete=models.SET_NULL, null=True, blank=True, related_name='plantilla_riegos')
    dosis_fertilizante = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    etapa              = models.CharField(max_length=15, choices=ETAPA_CHOICES, blank=True, default='')
    semana_relativa    = models.IntegerField(null=True, blank=True, verbose_name='Semana del ciclo')
    fase               = models.CharField(max_length=20, choices=FASE_CICLO, default='ambos', verbose_name='Aplica en')

    class Meta:
        ordering     = ['etapa', 'semana_relativa', 'nombre']
        verbose_name = 'Plantilla de riego'
        verbose_name_plural = 'Plantillas de riego'


class PracticaSostenible(models.Model):
    TIPO = [
        ('compost',           'Uso de compost'),
        ('sin_agroquimicos',  'Sin agroquímicos sintéticos'),
        ('riego_eficiente',   'Riego eficiente'),
        ('control_biologico', 'Control biológico'),
        ('abono_verde',       'Abono verde'),
        ('otro',              'Otra práctica'),
    ]
    campana     = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='practicas_sostenibles')
    tipo        = models.CharField(max_length=25, choices=TIPO, default='otro')
    descripcion = models.TextField()
    fecha       = models.DateField()
    cantidad    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unidad      = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['-fecha']


class CampanaAlerta(models.Model):
    TIPO = [
        ('riego',         'Riego'),
        ('fertilizacion', 'Fertilización orgánica'),
        ('control',       'Control preventivo'),
        ('cosecha',       'Cosecha'),
        ('seguridad',     'Intervalo de seguridad'),
        ('labor',         'Labor programada'),
        ('rotacion',      'Rotación de cultivos'),
        ('otro',          'Otro'),
    ]
    PRIORIDAD = [
        ('alta',  'Alta'),
        ('media', 'Media'),
        ('baja',  'Baja'),
    ]
    ORIGEN = [
        ('manual',    'Manual'),
        ('monitoreo', 'Monitoreo'),
        ('sistema',   'Sistema'),
    ]
    campana          = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name='alertas')
    tipo             = models.CharField(max_length=20, choices=TIPO)
    titulo           = models.CharField(max_length=200)
    descripcion      = models.TextField(blank=True)
    fecha_programada = models.DateField()
    prioridad        = models.CharField(max_length=5, choices=PRIORIDAD, default='media')
    completada       = models.BooleanField(default=False)
    origen           = models.CharField(max_length=15, choices=ORIGEN, default='manual', verbose_name='Origen')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['completada', 'fecha_programada', '-prioridad']
