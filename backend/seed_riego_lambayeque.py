"""
Seed script: 3 PlantillaRiego organicos por variedad — adaptados a Lambayeque.
Elimina todos los planes previos y crea 3 nuevos por variedad:
  Plan 1 — Riego de establecimiento   (germinacion/preparacion) + Acido humico
  Plan 2 — Fertirrigacion con Biol    (crecimiento/brotacion)   + Biol organico
  Plan 3 — Fertirrigacion de produccion (floracion/cosecha)     + Algas / Aminoacidos

Ejecutar: python seed_riego_lambayeque.py  (desde /backend con venv activo)
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.campanas.models import Variedad, ProductoAgricola, PlantillaRiego

# ── Lookup de productos organicos por nombre ──────────────────────────────────
def get_prod(nombre):
    try:
        return ProductoAgricola.objects.get(nombre=nombre)
    except ProductoAgricola.DoesNotExist:
        print(f'  [SKIP producto] "{nombre}"')
        return None

HUMICO    = get_prod('Acido humico + fulvico')
BIOL      = get_prod('Biol organico foliar')
ALGAS     = get_prod('Algas marinas Ascophyllum')
AMINOACID = get_prod('Aminoacidos hidrolizados 40%')

# Fallback por encoding
if HUMICO is None:
    try:
        HUMICO = ProductoAgricola.objects.get(nombre__icontains='mico')
        print(f'  [OK humico via icontains] {HUMICO.nombre}')
    except Exception:
        pass

if BIOL is None:
    try:
        BIOL = ProductoAgricola.objects.get(nombre__icontains='Biol')
        print(f'  [OK biol via icontains] {BIOL.nombre}')
    except Exception:
        pass

if ALGAS is None:
    try:
        ALGAS = ProductoAgricola.objects.get(nombre__icontains='Algas')
        print(f'  [OK algas via icontains] {ALGAS.nombre}')
    except Exception:
        pass

if AMINOACID is None:
    try:
        AMINOACID = ProductoAgricola.objects.get(nombre__icontains='mino')
        print(f'  [OK aminoacidos via icontains] {AMINOACID.nombre}')
    except Exception:
        pass

print(f'\nProductos organicos:')
print(f'  HUMICO    -> {HUMICO}')
print(f'  BIOL      -> {BIOL}')
print(f'  ALGAS     -> {ALGAS}')
print(f'  AMINOACID -> {AMINOACID}')

# ── Limpia registros previos ───────────────────────────────────────────────────
prev = PlantillaRiego.objects.count()
PlantillaRiego.objects.all().delete()
print(f'\nEliminados {prev} PlantillaRiego previos.')

created = 0

def add(variedad, nombre, metodo, litros_por_m2, frecuencia_dias,
        duracion_minutos=None, etapa='', semana_relativa=None,
        fertilizante=None, dosis_fertilizante=None):
    global created
    if variedad is None:
        return
    PlantillaRiego.objects.create(
        variedad=variedad,
        nombre=nombre,
        metodo=metodo,
        litros_por_m2=litros_por_m2,
        frecuencia_dias=frecuencia_dias,
        duracion_minutos=duracion_minutos,
        etapa=etapa,
        semana_relativa=semana_relativa,
        fertilizante=fertilizante,
        dosis_fertilizante=dosis_fertilizante,
    )
    created += 1

def vget(cultivo, nombre):
    try:
        return Variedad.objects.get(cultivo=cultivo, nombre=nombre)
    except Variedad.DoesNotExist:
        print(f'  [SKIP variedad] {cultivo} — {nombre}')
        return None

# ══════════════════════════════════════════════════════════════════════════════
# LECHUGA (Batavia, Romana, Crespa) — anual ~55-65d — biohuerto Lambayeque
# Clima calido seco: riego diario, volumen moderado
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Batavia', 'Romana', 'Crespa']:
    for var in Variedad.objects.filter(cultivo='Lechuga', nombre=nombre):
        add(var, 'Riego de germinacion',        'goteo', 1.5, 1, 20, 'germinacion', 1,  HUMICO,    0.002)
        add(var, 'Fertirrigacion con Biol',      'goteo', 2.0, 1, 20, 'crecimiento', 2,  BIOL,      0.003)
        add(var, 'Riego de maduracion con Algas','goteo', 1.8, 2, 15, 'cosecha',     7,  ALGAS,     0.002)

# ══════════════════════════════════════════════════════════════════════════════
# RABANITO (Crimson Giant, Blanco Largo) — anual ~30-35d
# Ciclo muy corto: enfocado en hidratacion rapida
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Crimson Giant', 'Blanco Largo']:
    var = vget('Rabanito', nombre)
    add(var, 'Riego de germinacion',             'goteo', 1.0, 1, 15, 'germinacion', 1,  HUMICO,    0.002)
    add(var, 'Fertirrigacion con Biol',          'goteo', 1.5, 2, 15, 'crecimiento', 2,  BIOL,      0.003)
    add(var, 'Riego de engrosamiento',           'goteo', 1.5, 2, 15, 'cosecha',     4,  AMINOACID, 0.002)

# ══════════════════════════════════════════════════════════════════════════════
# ESPINACA (Viroflay, Baby leaf) — anual ~30-45d
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Viroflay', 'Baby leaf']:
    var = vget('Espinaca', nombre)
    add(var, 'Riego de germinacion',             'goteo', 1.2, 1, 15, 'germinacion', 1,  HUMICO,    0.002)
    add(var, 'Fertirrigacion con Biol',          'goteo', 2.0, 1, 20, 'crecimiento', 2,  BIOL,      0.003)
    add(var, 'Riego de cosecha con Aminoacidos', 'goteo', 1.8, 2, 15, 'cosecha',     4,  AMINOACID, 0.002)

# ══════════════════════════════════════════════════════════════════════════════
# TOMATE (Rio Grande, Cherry, Momotaro, Larga Vida) — anual ~75-95d
# Lambayeque: calor intenso, goteo esencial para evitar enfermedades foliares
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Rio Grande', 'Cherry', 'Momotaro', 'Larga Vida']:
    var = vget('Tomate', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo='Tomate', nombre__icontains='Grande')
        except Exception:
            pass
    add(var, 'Riego de trasplante',              'goteo', 2.0, 2, 30, 'preparacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion con Biol',          'goteo', 3.0, 2, 35, 'crecimiento', 3,  BIOL,      0.005)
    add(var, 'Fertirrigacion de cuajado',        'goteo', 3.5, 2, 35, 'floracion',   7,  AMINOACID, 0.004)

# ══════════════════════════════════════════════════════════════════════════════
# PIMIENTO (California Wonder, Paprika, Piquillo) — anual ~80-90d
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['California Wonder', 'Paprika', 'Piquillo']:
    var = vget('Pimiento', nombre)
    add(var, 'Riego de trasplante',              'goteo', 2.0, 2, 30, 'preparacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion con Biol',          'goteo', 2.8, 2, 30, 'crecimiento', 3,  BIOL,      0.005)
    add(var, 'Fertirrigacion de cuajado',        'goteo', 3.2, 2, 35, 'floracion',   7,  ALGAS,     0.003)

# ══════════════════════════════════════════════════════════════════════════════
# PEPINO (Largo Verde, Japones) — anual ~50-55d
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Largo Verde', 'Japones']:
    var = vget('Pepino', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo='Pepino', nombre__icontains='apon')
        except Exception:
            pass
    add(var, 'Riego de establecimiento',         'goteo', 2.0, 2, 25, 'germinacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion con Biol',          'goteo', 3.0, 1, 30, 'crecimiento', 2,  BIOL,      0.005)
    add(var, 'Fertirrigacion de fructificacion', 'goteo', 3.5, 1, 30, 'cosecha',     6,  ALGAS,     0.003)

# ══════════════════════════════════════════════════════════════════════════════
# FRIJOL (Castilla, Canario, Loctao) — anual ~70-95d
# Frijol de palo y menestras tipicas de Lambayeque
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Castilla', 'Canario', 'Loctao']:
    var = vget('Frijol', nombre)
    add(var, 'Riego de siembra',                 'goteo', 1.5, 3, 20, 'preparacion', 1,  HUMICO,    0.002)
    add(var, 'Fertirrigacion con Biol',          'goteo', 2.0, 3, 20, 'crecimiento', 3,  BIOL,      0.003)
    add(var, 'Riego de floracion con Algas',     'goteo', 1.8, 3, 20, 'floracion',   7,  ALGAS,     0.002)

# ══════════════════════════════════════════════════════════════════════════════
# MAIZ (Choclero, Morado, Amarillo duro) — anual ~120-150d
# Lambayeque produce maiz amilaceo y morado; riego por aspersion o gravedad
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Choclero', 'Morado', 'Amarillo duro']:
    var = vget('Maiz', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo__icontains='Ma', nombre=nombre)
        except Exception:
            try:
                var = Variedad.objects.get(cultivo__icontains='az', nombre=nombre)
            except Exception:
                pass
    add(var, 'Riego de germinacion',             'aspersion', 3.0, 3, 30, 'germinacion', 1,  HUMICO,    0.005)
    add(var, 'Fertirrigacion con Biol',          'aspersion', 5.0, 5, 45, 'crecimiento', 4,  BIOL,      0.008)
    add(var, 'Riego de polinizacion con Algas',  'aspersion', 4.5, 5, 40, 'floracion',  10,  ALGAS,     0.005)

# ══════════════════════════════════════════════════════════════════════════════
# CEBOLLA (Roja Arequipena, Amarilla, Blanca) — anual ~105-120d
# Cebolla roja es cultivo emblematico de la costa norte del Peru
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Roja Arequipena', 'Amarilla', 'Blanca']:
    var = vget('Cebolla', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo='Cebolla', nombre__icontains='Roja')
        except Exception:
            pass
    add(var, 'Riego de trasplante',              'goteo', 2.0, 2, 25, 'preparacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion con Biol',          'goteo', 2.8, 2, 30, 'crecimiento', 4,  BIOL,      0.004)
    add(var, 'Riego de maduracion con Aminoacidos','goteo', 2.0, 4, 25, 'cosecha',   12,  AMINOACID, 0.003)

# ══════════════════════════════════════════════════════════════════════════════
# PAPA (Canchan, Huayro, Amarilla) — anual ~120-150d
# Papa nativa y comercial; aspersion en biohuerto
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Canchan', 'Huayro', 'Amarilla']:
    var = vget('Papa', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo='Papa', nombre__icontains=nombre[:4])
        except Exception:
            pass
    add(var, 'Riego de brotacion',               'aspersion', 3.0, 3, 30, 'germinacion', 2,  HUMICO,    0.004)
    add(var, 'Fertirrigacion con Biol',          'aspersion', 4.5, 3, 40, 'crecimiento', 5,  BIOL,      0.007)
    add(var, 'Riego de tuberizacion con Algas',  'aspersion', 4.0, 4, 40, 'floracion',   9,  ALGAS,     0.005)

# ══════════════════════════════════════════════════════════════════════════════
# ZAPALLO (Macre, Loche) — anual ~110-120d
# Loche de Lambayeque: variedad emblematica, requiere buen volumen de agua
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Macre', 'Loche']:
    var = vget('Zapallo', nombre)
    add(var, 'Riego de germinacion',             'goteo', 2.0, 3, 25, 'germinacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion con Biol',          'goteo', 3.0, 3, 30, 'crecimiento', 4,  BIOL,      0.005)
    add(var, 'Riego de fructificacion con Algas','goteo', 2.8, 4, 30, 'floracion',   8,  ALGAS,     0.003)

# ══════════════════════════════════════════════════════════════════════════════
# ESPARRAGO (UC-157, Atlas) — perenne — goteo
# Espárrago verde, cultivo exportacion Lambayeque
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['UC-157', 'Atlas']:
    var = vget('Esparrago', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo__icontains='sp', nombre=nombre)
        except Exception:
            pass
    add(var, 'Riego de establecimiento',         'goteo', 2.5, 3, 30, 'preparacion', 1,  HUMICO,    0.004)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 3.5, 2, 35, 'brotacion',   6,  BIOL,      0.007)
    add(var, 'Fertirrigacion cosecha con Algas', 'goteo', 3.0, 3, 35, 'cosecha',    10,  ALGAS,     0.005)

# ══════════════════════════════════════════════════════════════════════════════
# MANGO (Kent, Edward, Haden) — perenne — goteo
# Mango es cultivo estrella de Lambayeque; periodo seco favorece floracion
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Kent', 'Edward', 'Haden']:
    var = vget('Mango', nombre)
    add(var, 'Riego de mantenimiento',           'goteo', 4.0, 7, 40, 'preparacion', 1,  HUMICO,    0.005)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 5.0, 5, 45, 'brotacion',  None, BIOL,     0.010)
    add(var, 'Fertirrigacion llenado con Algas', 'goteo', 4.0, 7, 40, 'floracion',  None, ALGAS,    0.006)

# ══════════════════════════════════════════════════════════════════════════════
# PALTA (Hass, Fuerte, Zutano) — perenne — goteo
# Palta requiere riego preciso; estres hidrico en floracion mejora cuajado
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Hass', 'Fuerte', 'Zutano']:
    var = vget('Palta', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 4.5, 7, 45, 'preparacion', 1,  HUMICO,    0.006)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 5.5, 5, 50, 'brotacion',  None, BIOL,     0.010)
    add(var, 'Fertirrigacion Aminoacidos cuajado','goteo', 5.0, 5, 50, 'floracion',  None, AMINOACID, 0.006)

# ══════════════════════════════════════════════════════════════════════════════
# LIMON (Sutil, Tahiti) — perenne — goteo
# Limon sutil es cultivo basico del norte peruano
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Sutil', 'Tahiti']:
    var = vget('Limon', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo__icontains='im', nombre=nombre)
        except Exception:
            pass
    add(var, 'Riego de establecimiento',         'goteo', 3.0, 7, 35, 'preparacion', 1,  HUMICO,    0.005)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 3.8, 5, 40, 'brotacion',  None, BIOL,     0.008)
    add(var, 'Fertirrigacion Algas floracion',   'goteo', 3.5, 7, 35, 'floracion',  None, ALGAS,    0.005)

# ══════════════════════════════════════════════════════════════════════════════
# UVA (Red Globe, Crimson Seedless, Flame Seedless, Sweet Globe) — perenne
# Uva de mesa, cultivo importante en irrigaciones de Lambayeque
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Red Globe', 'Crimson Seedless', 'Flame Seedless', 'Sweet Globe']:
    var = vget('Uva', nombre)
    add(var, 'Riego post-poda',                  'goteo', 3.0, 7, 35, 'poda',       1,    HUMICO,    0.004)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 4.0, 5, 40, 'brotacion',  None, BIOL,      0.008)
    add(var, 'Fertirrigacion Aminoacidos cuajado','goteo', 3.8, 7, 40, 'floracion',  None, AMINOACID, 0.005)

# ══════════════════════════════════════════════════════════════════════════════
# MARACUYA (Amarilla, Morada) — perenne — goteo
# Maracuya crece vigoroso en clima calido Lambayeque
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Amarilla', 'Morada']:
    var = vget('Maracuya', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo__icontains='aracuy', nombre=nombre)
        except Exception:
            pass
    add(var, 'Riego de establecimiento',         'goteo', 3.5, 3, 35, 'preparacion', 1,  HUMICO,    0.005)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 4.5, 2, 40, 'brotacion',  None, BIOL,     0.010)
    add(var, 'Fertirrigacion Algas floracion',   'goteo', 4.0, 3, 40, 'floracion',  None, ALGAS,    0.006)

# ══════════════════════════════════════════════════════════════════════════════
# PAPAYA (Maradol, Hawaiian Solo) — perenne — goteo
# Papaya crecimiento rapido en clima calido; altamente demandante en agua
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Maradol', 'Hawaiian Solo']:
    var = vget('Papaya', nombre)
    add(var, 'Riego de establecimiento',         'goteo', 3.5, 2, 35, 'preparacion', 1,  HUMICO,    0.005)
    add(var, 'Fertirrigacion Biol vegetativo',   'goteo', 5.0, 2, 40, 'brotacion',  None, BIOL,     0.012)
    add(var, 'Fertirrigacion Aminoacidos fruto', 'goteo', 4.5, 2, 40, 'floracion',  None, AMINOACID, 0.007)

# ══════════════════════════════════════════════════════════════════════════════
# ARANDANO (Biloxi, Emerald) — perenne — goteo (pH acido 4.5-5.5)
# Arandano Biloxi se adapta bien a costa norte; requiere pH acido
# ══════════════════════════════════════════════════════════════════════════════
for nombre in ['Biloxi', 'Emerald']:
    var = vget('Arandano', nombre)
    if var is None:
        try:
            var = Variedad.objects.get(cultivo__icontains='rand', nombre=nombre)
        except Exception:
            pass
    add(var, 'Riego de establecimiento',         'goteo', 2.0, 2, 25, 'preparacion', 1,  HUMICO,    0.003)
    add(var, 'Fertirrigacion Biol brotacion',    'goteo', 2.8, 1, 30, 'brotacion',  None, BIOL,     0.004)
    add(var, 'Fertirrigacion Algas floracion',   'goteo', 2.8, 2, 30, 'floracion',  None, ALGAS,    0.004)

# ══════════════════════════════════════════════════════════════════════════════
# RESUMEN
# ══════════════════════════════════════════════════════════════════════════════
print(f'\n{"="*60}')
print(f'OK: {created} registros PlantillaRiego creados.')
print(f'{"="*60}\n')

from django.db.models import Count
rows = PlantillaRiego.objects.values(
    'variedad__cultivo', 'variedad__nombre'
).annotate(n=Count('id')).order_by('variedad__cultivo', 'variedad__nombre')

total_vars = 0
for row in rows:
    planes = row['n']
    marca = 'OK' if planes == 3 else f'!!! {planes}'
    print(f"  [{marca}] {row['variedad__cultivo']} — {row['variedad__nombre']}")
    total_vars += 1

print(f'\nTotal variedades con planes de riego: {total_vars}')
print(f'Total planes creados:                 {created}')
