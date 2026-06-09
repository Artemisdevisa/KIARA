"""
Seed script: PlantillaRiego para todas las variedades del sistema.
Ejecutar: python seed_plantilla_riego.py  (desde /backend con venv activo)
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.campanas.models import Variedad, ProductoAgricola, PlantillaRiego

# ── Lookup de fertilizantes por nombre (robusto ante cualquier pk) ──────────
_FERTS = {
    13: 'Urea 46%',
    14: 'Nitrato de amonio 33%',
    15: 'Fosfato diamónico DAP',
    16: 'Cloruro de potasio 60%',
    17: 'Sulfato de potasio 50%',
    18: 'Nitrato de calcio 15.5%',
    19: 'Sulfato de magnesio',
    20: 'Ácido fosfórico 85%',
    21: 'Nitrato de potasio 13-0-46',
    22: 'MAP (monofosfato de amonio)',
    23: 'Sulfato de zinc',
    24: 'Ácido bórico 17%',
}

def f(alias):
    """Acepta el alias numérico original o un nombre directo."""
    nombre = _FERTS.get(alias, alias)
    try:
        return ProductoAgricola.objects.get(nombre=nombre)
    except ProductoAgricola.DoesNotExist:
        print(f'  [SKIP fertilizante] "{nombre}"')
        return None

def v(cultivo, nombre):
    try:
        return Variedad.objects.get(cultivo=cultivo, nombre=nombre)
    except Variedad.DoesNotExist:
        print(f'  [SKIP variedad] {cultivo} — {nombre}')
        return None

# Limpia los registros previos para poder re-ejecutar el script limpio
PlantillaRiego.objects.all().delete()

created = 0

def add(variedad, nombre, metodo, litros_por_m2, frecuencia_dias,
        duracion_minutos=None, etapa='', semana_relativa=None,
        fertilizante_pk=None, dosis_fertilizante=None):
    global created
    if variedad is None:
        return
    fert = f(fertilizante_pk) if fertilizante_pk is not None else None
    PlantillaRiego.objects.create(
        variedad=variedad,
        nombre=nombre,
        metodo=metodo,
        litros_por_m2=litros_por_m2,
        frecuencia_dias=frecuencia_dias,
        duracion_minutos=duracion_minutos,
        etapa=etapa,
        semana_relativa=semana_relativa,
        fertilizante=fert,
        dosis_fertilizante=dosis_fertilizante,
    )
    created += 1

# ══════════════════════════════════════════════════════════════════════════════
# LECHUGAS  (Batavia, Romana, Crespa ×2) — anual ~55-65d  — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Batavia', 'Romana', 'Crespa']:
    variants = Variedad.objects.filter(cultivo='Lechuga', nombre=nombre)
    for var in variants:
        add(var, 'Riego diario — germinación',     'goteo', 1.50, 1, 20, 'germinacion', 1,  22, 0.003)
        add(var, 'Fertirrigación nitrogenada',     'goteo', 2.50, 1, 25, 'crecimiento', 2,  13, 0.004)
        add(var, 'Riego de maduración',            'goteo', 2.00, 2, 25, 'cosecha',     7,  21, 0.003)

# ══════════════════════════════════════════════════════════════════════════════
# RABANITO (Crimson Giant, Blanco Largo) — anual ~30-35d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Crimson Giant', 'Blanco Largo']:
    var = v('Rabanito', nombre)
    add(var, 'Riego inicial — germinación',    'goteo', 1.00, 1, 15, 'germinacion', 1,  22, 0.002)
    add(var, 'Fertirrigación de engrosamiento','goteo', 1.50, 2, 20, 'crecimiento', 2,  13, 0.003)
    add(var, 'Riego de cosecha',               'goteo', 1.50, 2, 20, 'cosecha',     4,  16, 0.002)

# ══════════════════════════════════════════════════════════════════════════════
# ESPINACA (Viroflay, Baby leaf) — anual ~30-45d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Viroflay', 'Baby leaf']:
    var = v('Espinaca', nombre)
    add(var, 'Riego diario — germinación',     'goteo', 1.20, 1, 15, 'germinacion', 1,  22, 0.002)
    add(var, 'Fertirrigación nitrogenada',     'goteo', 2.00, 1, 20, 'crecimiento', 2,  13, 0.004)
    add(var, 'Riego de cosecha',               'goteo', 1.80, 2, 20, 'cosecha',     4,  21, 0.003)

# ══════════════════════════════════════════════════════════════════════════════
# TOMATE (Río Grande, Cherry, Momotaro, Larga Vida) — anual ~75-95d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Río Grande', 'Cherry', 'Momotaro', 'Larga Vida']:
    var = v('Tomate', nombre)
    add(var, 'Riego de trasplante',              'goteo', 2.00, 2, 30, 'preparacion', 1,  15, 0.005)
    add(var, 'Fertirrigación N en crecimiento',  'goteo', 3.00, 2, 35, 'crecimiento', 3,  13, 0.006)
    add(var, 'Fertirrigación Ca en cuajado',     'goteo', 3.50, 2, 35, 'floracion',   7,  18, 0.005)
    add(var, 'Fertirrigación K en cosecha',      'goteo', 3.00, 2, 35, 'cosecha',    10,  21, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# PIMIENTO (California Wonder, Paprika, Piquillo) — anual ~80-90d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['California Wonder', 'Paprika', 'Piquillo']:
    var = v('Pimiento', nombre)
    add(var, 'Riego de trasplante',              'goteo', 2.00, 2, 30, 'preparacion', 1,  15, 0.005)
    add(var, 'Fertirrigación N en crecimiento',  'goteo', 2.80, 2, 30, 'crecimiento', 3,  13, 0.006)
    add(var, 'Fertirrigación Ca en cuajado',     'goteo', 3.20, 2, 35, 'floracion',   7,  18, 0.004)
    add(var, 'Fertirrigación K en maduración',   'goteo', 2.80, 3, 35, 'cosecha',    10,  21, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# PEPINO (Largo Verde, Japonés) — anual ~50-55d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Largo Verde', 'Japonés']:
    var = v('Pepino', nombre)
    add(var, 'Riego diario — establecimiento',   'goteo', 2.00, 2, 25, 'germinacion', 1,  22, 0.003)
    add(var, 'Fertirrigación N en crecimiento',  'goteo', 3.00, 1, 30, 'crecimiento', 2,  13, 0.005)
    add(var, 'Fertirrigación K en cosecha',      'goteo', 3.50, 1, 30, 'cosecha',     6,  21, 0.004)

# ══════════════════════════════════════════════════════════════════════════════
# FRIJOL (Castilla, Canario, Loctao) — anual ~70-95d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Castilla', 'Canario', 'Loctao']:
    var = v('Frijol', nombre)
    add(var, 'Riego de siembra',                 'goteo', 1.50, 3, 20, 'preparacion', 1,  15, 0.003)
    add(var, 'Riego de crecimiento vegetativo',  'goteo', 2.00, 3, 20, 'crecimiento', 3,  13, 0.004)
    add(var, 'Riego de floración',               'goteo', 1.80, 4, 20, 'floracion',   7,  21, 0.003)
    add(var, 'Riego de llenado de vaina',        'goteo', 1.50, 4, 20, 'cosecha',    10,  None, None)

# ══════════════════════════════════════════════════════════════════════════════
# MAÍZ (Choclero, Morado, Amarillo duro) — anual ~120-150d — manual/aspersión
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Choclero', 'Morado', 'Amarillo duro']:
    var = v('Maíz', nombre)
    add(var, 'Riego de germinación',             'manual',    2.50, 3, None,'germinacion',  1,  15, 0.006)
    add(var, 'Fertirrigación N crecimiento',     'aspersion', 5.00, 7, 45,  'crecimiento',  4,  13, 0.010)
    add(var, 'Riego de floración',               'aspersion', 4.00, 5, 40,  'floracion',   10,  21, 0.006)
    add(var, 'Riego de llenado de grano',        'aspersion', 3.50, 7, 40,  'cosecha',     14,  17, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# CEBOLLA (Roja Arequipeña, Amarilla, Blanca) — anual ~105-120d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Roja Arequipeña', 'Amarilla', 'Blanca']:
    var = v('Cebolla', nombre)
    add(var, 'Riego de trasplante',              'goteo', 2.00, 2, 25, 'preparacion', 1,  15, 0.005)
    add(var, 'Fertirrigación N bulbificación',   'goteo', 2.80, 2, 30, 'crecimiento', 4,  13, 0.006)
    add(var, 'Riego de maduración de bulbo',     'goteo', 2.00, 4, 25, 'cosecha',    12,  17, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# PAPA (Canchán, Huayro, Amarilla) — anual ~120-150d — aspersión
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Canchán', 'Huayro', 'Amarilla']:
    var = v('Papa', nombre)
    add(var, 'Riego de brotación',               'aspersion', 3.00, 3, 30, 'germinacion',  2,  15, 0.005)
    add(var, 'Fertirrigación N crecimiento',     'aspersion', 4.50, 3, 40, 'crecimiento',  5,  13, 0.008)
    add(var, 'Fertirrigación Ca floración',      'aspersion', 4.00, 4, 40, 'floracion',    9,  18, 0.006)
    add(var, 'Riego de tuberización',            'aspersion', 3.00, 5, 35, 'cosecha',     14,  17, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# ZAPALLO (Macre, Loche) — anual ~110-120d — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Macre', 'Loche']:
    var = v('Zapallo', nombre)
    add(var, 'Riego de germinación',             'goteo', 2.00, 3, 25, 'germinacion', 1,  22, 0.003)
    add(var, 'Fertirrigación N crecimiento',     'goteo', 3.00, 3, 30, 'crecimiento', 4,  13, 0.006)
    add(var, 'Riego de floración',               'goteo', 2.80, 4, 30, 'floracion',   8,  15, 0.004)
    add(var, 'Riego de llenado de fruto',        'goteo', 2.50, 5, 30, 'cosecha',    12,  17, 0.004)

# ══════════════════════════════════════════════════════════════════════════════
# ESPÁRRAGO (UC-157, Atlas) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['UC-157', 'Atlas']:
    var = v('Espárrago', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 2.50, 3, 30, 'preparacion', 1,  15, 0.005)
    add(var, 'Fertirrigación N brotación',       'goteo', 3.50, 2, 35, 'brotacion',   6,  13, 0.008)
    add(var, 'Fertirrigación K cosecha',         'goteo', 3.00, 3, 35, 'cosecha',    10,  21, 0.006)

# ══════════════════════════════════════════════════════════════════════════════
# MANGO (Kent, Edward, Haden) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Kent', 'Edward', 'Haden']:
    var = v('Mango', nombre)
    add(var, 'Riego de mantenimiento',           'goteo', 4.00, 7, 40, 'preparacion', 1,  15, 0.006)
    add(var, 'Fertirrigación N brotación',       'goteo', 5.00, 5, 45, 'brotacion',  None, 13, 0.010)
    add(var, 'Fertirrigación K floración',       'goteo', 4.00, 7, 40, 'floracion',  None, 21, 0.006)
    add(var, 'Riego de llenado de fruto',        'goteo', 3.50, 7, 40, 'cosecha',    None, 17, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# PALTA (Hass, Fuerte, Zutano) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Hass', 'Fuerte', 'Zutano']:
    var = v('Palta', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 4.50, 7, 45, 'preparacion', 1,  15, 0.006)
    add(var, 'Fertirrigación N brotación',       'goteo', 5.50, 5, 50, 'brotacion',  None, 13, 0.010)
    add(var, 'Fertirrigación Ca floración',      'goteo', 5.00, 5, 50, 'floracion',  None, 18, 0.007)
    add(var, 'Fertirrigación K maduración',      'goteo', 4.00, 7, 45, 'cosecha',    None, 21, 0.006)

# ══════════════════════════════════════════════════════════════════════════════
# LIMÓN (Sutil, Tahití) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Sutil', 'Tahití']:
    var = v('Limón', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 3.00, 7, 35, 'preparacion', 1,  15, 0.005)
    add(var, 'Fertirrigación N brotación',       'goteo', 3.80, 5, 40, 'brotacion',  None, 13, 0.008)
    add(var, 'Fertirrigación K floración',       'goteo', 3.50, 7, 35, 'floracion',  None, 21, 0.005)
    add(var, 'Riego de producción',              'goteo', 3.00, 7, 35, 'cosecha',    None, 17, 0.004)

# ══════════════════════════════════════════════════════════════════════════════
# UVA (Red Globe, Crimson Seedless, Flame Seedless, Sweet Globe) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Red Globe', 'Crimson Seedless', 'Flame Seedless', 'Sweet Globe']:
    var = v('Uva', nombre)
    add(var, 'Riego post-poda',                  'goteo', 3.00, 7, 35, 'poda',        1,  15, 0.005)
    add(var, 'Fertirrigación N brotación',       'goteo', 4.00, 5, 40, 'brotacion',  None, 13, 0.008)
    add(var, 'Fertirrigación Ca-B cuajado',      'goteo', 3.50, 7, 40, 'floracion',  None, 18, 0.006)
    add(var, 'Fertirrigación K maduración',      'goteo', 3.80, 7, 40, 'cosecha',    None, 17, 0.006)

# ══════════════════════════════════════════════════════════════════════════════
# MARACUYÁ (Amarilla, Morada) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Amarilla', 'Morada']:
    var = v('Maracuyá', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 3.50, 3, 35, 'preparacion', 1,  15, 0.006)
    add(var, 'Fertirrigación N brotación',       'goteo', 4.50, 2, 40, 'brotacion',  None, 13, 0.010)
    add(var, 'Fertirrigación K floración',       'goteo', 4.00, 3, 40, 'floracion',  None, 21, 0.007)
    add(var, 'Riego de llenado de fruto',        'goteo', 3.50, 3, 35, 'cosecha',    None, 17, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# PAPAYA (Maradol, Hawaiian Solo) — perenne — goteo
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Maradol', 'Hawaiian Solo']:
    var = v('Papaya', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 3.50, 2, 35, 'preparacion', 1,  15, 0.006)
    add(var, 'Fertirrigación N vegetativo',      'goteo', 5.00, 2, 40, 'brotacion',  None, 13, 0.012)
    add(var, 'Fertirrigación Ca-N floración',    'goteo', 4.50, 2, 40, 'floracion',  None, 18, 0.008)
    add(var, 'Fertirrigación K llenado',         'goteo', 4.00, 2, 40, 'cosecha',    None, 21, 0.007)

# ══════════════════════════════════════════════════════════════════════════════
# ARÁNDANO (Biloxi, Emerald) — perenne — goteo (pH ácido, sulfatos)
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Biloxi', 'Emerald']:
    var = v('Arándano', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 2.00, 2, 25, 'preparacion', 1,  20, 0.002)
    add(var, 'Fertirrigación S-K brotación',     'goteo', 2.80, 1, 30, 'brotacion',  None, 17, 0.004)
    add(var, 'Fertirrigación N-K floración',     'goteo', 2.80, 2, 30, 'floracion',  None, 21, 0.004)
    add(var, 'Riego de maduración de fruto',     'goteo', 2.50, 2, 30, 'cosecha',    None, 17, 0.003)

print(f'\nOK: {created} registros PlantillaRiego creados correctamente.\n')
# Resumen por variedad
from django.db.models import Count
for row in PlantillaRiego.objects.values('variedad__cultivo','variedad__nombre').annotate(n=Count('id')).order_by('variedad__cultivo','variedad__nombre'):
    print(f"  {row['variedad__cultivo']} — {row['variedad__nombre']}: {row['n']} riego{'s' if row['n']!=1 else ''}")
