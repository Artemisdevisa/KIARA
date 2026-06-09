"""
Seed de Variedad, ProductoAgricola y TipoLabor.
Debe ejecutarse ANTES que seed_catalogos2.py y seed_plantillas.py

Ejecutar:  python seed_catalogos1.py
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import Variedad, ProductoAgricola, TipoLabor

# ══════════════════════════════════════════════════════════
# VARIEDADES
# Nombres cortos exactos que esperan seed_plantillas.py y
# seed_plantilla_riego.py en sus queries filter/get
# ══════════════════════════════════════════════════════════
print('\n=== VARIEDADES ===')

# Limpiar variedades mal creadas previamente
Variedad.objects.all().delete()
print('  (previas eliminadas)')

VARIEDADES = [
    # (cultivo, nombre, subtipo, tipo_ciclo, dias_ciclo)
    # Lechuga — Crespa usa nombre='Crespa' con subtipo como discriminador
    ('Lechuga',   'Batavia',          'batavia',        'anual',    60),
    ('Lechuga',   'Romana',           'romana',         'anual',    65),
    ('Lechuga',   'Crespa',           'Verde',          'anual',    55),
    ('Lechuga',   'Crespa',           'Morada',         'anual',    55),
    # Tomate
    ('Tomate',    'Río Grande',       'industria',      'anual',   110),
    ('Tomate',    'Cherry',           'cherry',         'anual',    90),
    ('Tomate',    'Momotaro',         'ensalada',       'anual',   100),
    ('Tomate',    'Larga Vida',       'larga vida',     'anual',   105),
    # Pimiento
    ('Pimiento',  'California Wonder','morrón',         'anual',    90),
    ('Pimiento',  'Paprika',          'paprika',        'anual',   100),
    ('Pimiento',  'Piquillo',         'piquillo',       'anual',    95),
    # Pepino
    ('Pepino',    'Largo Verde',      'largo',          'anual',    55),
    ('Pepino',    'Japonés',          'japonés',        'anual',    50),
    # Zapallo
    ('Zapallo',   'Macre',            'macre',          'anual',   120),
    ('Zapallo',   'Loche',            'loche',          'anual',   100),
    # Maíz
    ('Maíz',      'Choclero',         'choclero',       'anual',   120),
    ('Maíz',      'Morado',           'morado',         'anual',   150),
    ('Maíz',      'Amarillo duro',    'amarillo',       'anual',   130),
    # Cebolla
    ('Cebolla',   'Roja Arequipeña',  'roja',           'anual',   120),
    ('Cebolla',   'Amarilla',         'amarilla',       'anual',   110),
    ('Cebolla',   'Blanca',           'blanca',         'anual',   100),
    # Frijol
    ('Frijol',    'Castilla',         'castilla',       'anual',    75),
    ('Frijol',    'Canario',          'canario',        'anual',    90),
    ('Frijol',    'Loctao',           'loctao',         'anual',    70),
    # Papa
    ('Papa',      'Canchán',          'canchan',        'anual',   120),
    ('Papa',      'Huayro',           'huayro',         'anual',   130),
    ('Papa',      'Amarilla',         'amarilla',       'anual',   110),
    # Espinaca
    ('Espinaca',  'Viroflay',         'viroflay',       'anual',    45),
    ('Espinaca',  'Baby leaf',        'baby',           'anual',    35),
    # Rabanito
    ('Rabanito',  'Crimson Giant',    'crimson',        'anual',    30),
    ('Rabanito',  'Blanco Largo',     'blanco',         'anual',    35),
    # Perennes
    ('Palta',     'Hass',             'hass',           'perenne', 365),
    ('Palta',     'Fuerte',           'fuerte',         'perenne', 365),
    ('Palta',     'Zutano',           'zutano',         'perenne', 365),
    ('Mango',     'Kent',             'kent',           'perenne', 120),
    ('Mango',     'Edward',           'edward',         'perenne', 120),
    ('Mango',     'Haden',            'haden',          'perenne', 120),
    ('Uva',       'Red Globe',        'red globe',      'perenne', 150),
    ('Uva',       'Crimson Seedless', 'crimson',        'perenne', 140),
    ('Uva',       'Flame Seedless',   'flame',          'perenne', 135),
    ('Uva',       'Sweet Globe',      'sweet',          'perenne', 130),
    ('Limón',     'Sutil',            'sutil',          'perenne', 240),
    ('Limón',     'Tahití',           'tahiti',         'perenne', 240),
    ('Espárrago', 'UC-157',           'uc-157',         'perenne', 365),
    ('Espárrago', 'Atlas',            'atlas',          'perenne', 365),
    ('Maracuyá',  'Amarilla',         'amarilla',       'perenne', 270),
    ('Maracuyá',  'Morada',           'morada',         'perenne', 270),
    ('Arándano',  'Biloxi',           'biloxi',         'perenne', 365),
    ('Arándano',  'Emerald',          'emerald',        'perenne', 365),
    ('Papaya',    'Maradol',          'maradol',        'perenne', 270),
    ('Papaya',    'Hawaiian Solo',    'hawaiian',       'perenne', 270),
]

for cultivo, nombre, subtipo, tipo_ciclo, dias in VARIEDADES:
    obj, created = Variedad.objects.get_or_create(
        cultivo=cultivo, nombre=nombre, subtipo=subtipo,
        defaults={'tipo_ciclo': tipo_ciclo, 'dias_ciclo': dias}
    )
    print(f'  {"✓" if created else "·"} [{tipo_ciclo:7s}] {cultivo} — {nombre} ({subtipo})')

print(f'\n  Total variedades: {Variedad.objects.count()}')

# ══════════════════════════════════════════════════════════
# PRODUCTOS AGRÍCOLAS
# Nombres exactos que usan seed_plantillas.py y seed_plantillas2.py
# ══════════════════════════════════════════════════════════
print('\n=== PRODUCTOS AGRÍCOLAS ===')

PRODUCTOS = [
    # (nombre, tipo, unidad, precio_unitario)
    # ── Fitosanitarios ──
    ('Mancozeb 80% WP',              'fitosanitario', 'kg',  28.0),
    ('Clorotalonil 72% SC',          'fitosanitario', 'L',   35.0),
    ('Azoxystrobin 25% SC',          'fitosanitario', 'L',   85.0),
    ('Metalaxil + Mancozeb',         'fitosanitario', 'kg',  42.0),
    ('Iprodione 50% WP',             'fitosanitario', 'kg',  55.0),
    ('Tebuconazol 25% EC',           'fitosanitario', 'L',   65.0),
    ('Fosetil aluminio 80% WP',      'fitosanitario', 'kg',  38.0),
    ('Oxicloruro de cobre 50%',      'fitosanitario', 'kg',  18.0),  # nombre exacto que usa seed_plantillas
    ('Deltametrina 2.5% EC',         'fitosanitario', 'L',   32.0),
    ('Lambdacialotrina 5% EC',       'fitosanitario', 'L',   28.0),
    ('Imidacloprid 35% SC',          'fitosanitario', 'L',   72.0),
    ('Acetamiprid 20% SP',           'fitosanitario', 'kg',  88.0),
    ('Spiromesifen 24% SC',          'fitosanitario', 'L',   95.0),
    ('Abamectina 1.8% EC',           'fitosanitario', 'L',  120.0),
    ('Clorpirifos 48% EC',           'fitosanitario', 'L',   25.0),
    ('Metarhizium anisopliae',        'fitosanitario', 'kg',  45.0),
    ('Beauveria bassiana',            'fitosanitario', 'kg',  48.0),
    ('Bacillus thuringiensis',        'fitosanitario', 'kg',  55.0),
    ('Trichoderma harzianum',         'fitosanitario', 'kg',  42.0),
    ('Extracto de neem 3%',          'fitosanitario', 'L',   38.0),
    ('Jabón potásico 45%',           'fitosanitario', 'L',   22.0),
    ('Azufre mojable 80% WP',        'fitosanitario', 'kg',  15.0),
    # ── Fertilizantes (orden importante: seed_plantilla_riego usa nombres para lookup) ──
    ('Urea 46%',                     'fertilizante',  'kg',   2.2),
    ('Nitrato de amonio 33%',        'fertilizante',  'kg',   2.5),
    ('Fosfato diamónico DAP',        'fertilizante',  'kg',   3.8),  # nombre exacto usado en seeds
    ('Cloruro de potasio 60%',       'fertilizante',  'kg',   2.8),
    ('Sulfato de potasio 50%',       'fertilizante',  'kg',   4.2),
    ('Nitrato de calcio 15.5%',      'fertilizante',  'kg',   3.0),
    ('Sulfato de magnesio',          'fertilizante',  'kg',   2.0),
    ('Ácido fosfórico 85%',          'fertilizante',  'L',   12.0),
    ('Nitrato de potasio 13-0-46',   'fertilizante',  'kg',   5.5),
    ('MAP (monofosfato de amonio)',   'fertilizante',  'kg',   4.5),
    ('Sulfato de zinc',              'fertilizante',  'kg',   8.5),
    ('Ácido bórico 17%',             'fertilizante',  'kg',   8.0),
    ('Superfosfato triple 46%',      'fertilizante',  'kg',   3.5),
    ('Quelato de zinc EDTA 14%',     'fertilizante',  'kg',  22.0),
    ('Quelato de hierro EDTA 13%',   'fertilizante',  'kg',  28.0),
    ('Compost orgánico',             'fertilizante',  'kg',   0.8),
    ('Guano de isla',                'fertilizante',  'kg',   3.5),
    ('Humus de lombriz',             'fertilizante',  'kg',   1.5),
    ('Biol (biofertilizante)',       'fertilizante',  'L',    1.2),
    ('Sulfato de calcio (yeso)',     'fertilizante',  'kg',   1.0),
    # ── Bioestimulantes ──
    ('Aminoácidos hidrolizados 40%', 'bioestimulante','L',   45.0),
    ('Ácido húmico + fúlvico',       'bioestimulante','L',   38.0),  # nombre exacto usado en seeds
    ('Algas marinas Ascophyllum',    'bioestimulante','L',   55.0),  # nombre exacto usado en seeds
    ('Ácido giberélico 10%',         'bioestimulante','L',   65.0),  # usado en palta, mango, uva, etc.
    ('Citoquininas naturales',       'bioestimulante','L',   65.0),
    ('Silicio soluble 25%',          'bioestimulante','L',   42.0),
    ('Enraizador (AIA 0.5%)',        'bioestimulante','L',   35.0),
    ('Bioactivador de suelo',        'bioestimulante','L',   48.0),
]

for nombre, tipo, unidad, precio in PRODUCTOS:
    obj, created = ProductoAgricola.objects.get_or_create(
        nombre=nombre,
        defaults={'tipo': tipo, 'unidad': unidad, 'precio_unitario': precio}
    )
    print(f'  {"✓" if created else "·"} [{tipo:15s}] {nombre}')

print(f'\n  Total productos: {ProductoAgricola.objects.count()}')

# ══════════════════════════════════════════════════════════
# TIPOS DE LABOR
# ══════════════════════════════════════════════════════════
print('\n=== TIPOS DE LABOR ===')

LABORES = [
    # (codigo, nombre, tipo, unidad_default, costo_unitario)
    ('LB-001', 'Subsolado / roturación',               'otro',       'ha',     180.0),
    ('LB-002', 'Incorporación de materia orgánica',    'otro',       'ha',      80.0),
    ('LB-003', 'Nivelación y formación de camas',      'otro',       'ha',     120.0),
    ('LB-004', 'Siembra directa',                      'otro',       'ha',     150.0),
    ('LB-005', 'Trasplante de plántulas',              'otro',       'millar',  90.0),
    ('LB-006', 'Raleo de plantas',                     'otro',       'hora',    15.0),
    ('LB-007', 'Instalación de tutores / espalderas',  'formacion',  'unidad',   2.5),
    ('LB-008', 'Entutorado y amarre de plantas',       'formacion',  'hora',    15.0),
    ('LB-009', 'Poda de formación',                    'poda',       'hora',    18.0),
    ('LB-010', 'Poda de mantenimiento / sanitaria',    'poda',       'hora',    18.0),
    ('LB-011', 'Poda de producción',                   'poda',       'hora',    18.0),
    ('LB-012', 'Despunte y deshoje',                   'formacion',  'hora',    15.0),
    ('LB-013', 'Deshije / eliminación de hijuelos',    'formacion',  'hora',    15.0),
    ('LB-014', 'Aclareo de frutos',                    'formacion',  'hora',    15.0),
    ('LB-015', 'Riego de establecimiento',             'riego',      'hora',    12.0),
    ('LB-016', 'Riego de mantenimiento',               'riego',      'hora',    12.0),
    ('LB-017', 'Instalación de sistema de riego',      'riego',      'global', 350.0),
    ('LB-018', 'Fertiirrigación',                      'riego',      'hora',    14.0),
    ('LB-019', 'Aplicación de fungicida',              'aplicacion', 'ha',      45.0),
    ('LB-020', 'Aplicación de insecticida',            'aplicacion', 'ha',      45.0),
    ('LB-021', 'Aplicación de fertilizante foliar',   'aplicacion', 'ha',      40.0),
    ('LB-022', 'Aplicación de bioestimulante',         'aplicacion', 'ha',      40.0),
    ('LB-023', 'Deshierbo / control de malezas',       'otro',       'ha',     120.0),
    ('LB-024', 'Aporque',                              'otro',       'ha',      90.0),
    ('LB-025', 'Mulching / acolchado',                 'otro',       'ha',     200.0),
    ('LB-026', 'Evaluación fitosanitaria',             'otro',       'hora',    20.0),
    ('LB-027', 'Polinización asistida',                'otro',       'hora',    18.0),
    ('LB-028', 'Monitoreo de trampas',                 'otro',       'hora',    15.0),
    ('LB-029', 'Cosecha',                              'cosecha',    'hora',    18.0),
    ('LB-030', 'Selección y clasificación post-cosecha','cosecha',   'hora',    15.0),
    ('LB-031', 'Empaque',                              'cosecha',    'hora',    15.0),
    ('LB-032', 'Limpieza y desinfección de campo',     'otro',       'hora',    14.0),
]

for codigo, nombre, tipo, unidad, costo in LABORES:
    obj, created = TipoLabor.objects.get_or_create(
        codigo=codigo,
        defaults={'nombre': nombre, 'tipo': tipo, 'unidad_default': unidad, 'costo_unitario_default': costo}
    )
    print(f'  {"✓" if created else "·"} {codigo} — {nombre}')

print(f'\n  Total labores: {TipoLabor.objects.count()}')
print('\n✅ seed_catalogos1.py completado.')
print('   Siguiente: python seed_catalogos2.py')
