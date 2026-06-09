"""
Patch PlantillaLabor para biohuerto organico en Lambayeque.
Agrega labores organicas faltantes sin eliminar las existentes.

Labores que se agregan:
  1. Incorporacion materia organica (preparacion sem 0) — para todos los cultivos
  2. Muestreo y analisis de suelo   (preparacion sem 0) — para anuales
  3. Instalacion sistema goteo      (preparacion sem 0) — biohuerto tecnificado
  4. Evaluacion fenologica           (floracion)         — perennes

Ejecutar: python seed_labores_lambayeque.py (desde /backend con venv activo)
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.campanas.models import PlantillaLabor, TipoLabor, Variedad

def tl(nombre):
    try:
        return TipoLabor.objects.get(nombre=nombre)
    except TipoLabor.DoesNotExist:
        try:
            return TipoLabor.objects.get(nombre__icontains=nombre[:10])
        except TipoLabor.DoesNotExist:
            print(f'  [SKIP tipo_labor] "{nombre}"')
            return None

INC_ORG   = tl('Incorporación materia orgánica')
MUESTREO  = tl('Muestreo y análisis de suelo')
GOTEO_INS = tl('Instalación sistema goteo')
EVAL_FEN  = tl('Evaluación fenológica')

if INC_ORG is None:
    INC_ORG = tl('Incorporaci')
if MUESTREO is None:
    MUESTREO = tl('Muestreo')
if GOTEO_INS is None:
    GOTEO_INS = tl('Instalaci')
if EVAL_FEN is None:
    EVAL_FEN = tl('Evaluaci')

print(f'INC_ORG   -> {INC_ORG}')
print(f'MUESTREO  -> {MUESTREO}')
print(f'GOTEO_INS -> {GOTEO_INS}')
print(f'EVAL_FEN  -> {EVAL_FEN}')

added = 0

def add_if_missing(variedad, tipo_labor, etapa, cantidad, semana_relativa=None):
    global added
    if tipo_labor is None or variedad is None:
        return
    exists = PlantillaLabor.objects.filter(
        variedad=variedad, tipo_labor=tipo_labor, etapa=etapa
    ).exists()
    if not exists:
        PlantillaLabor.objects.create(
            variedad=variedad,
            tipo_labor=tipo_labor,
            etapa=etapa,
            cantidad=cantidad,
            semana_relativa=semana_relativa,
        )
        added += 1
        print(f'  + [{etapa}] {tipo_labor.nombre} — {variedad.cultivo} {variedad.nombre}')

# ── 1. Incorporacion materia organica en preparacion — TODOS los cultivos ─────
print('\n=== Incorporacion materia organica en preparacion ===')
for var in Variedad.objects.all().order_by('cultivo', 'nombre'):
    add_if_missing(var, INC_ORG, 'preparacion', 4.0, semana_relativa=0)

# ── 2. Muestreo y analisis de suelo en preparacion — cultivos anuales ─────────
ANUALES = [
    'Lechuga','Espinaca','Rabanito','Tomate','Pimiento',
    'Pepino','Frijol','Maiz','Cebolla','Papa','Zapallo',
]
print('\n=== Muestreo de suelo en preparacion (anuales) ===')
for cultivo in ANUALES:
    for var in Variedad.objects.filter(cultivo=cultivo):
        add_if_missing(var, MUESTREO, 'preparacion', 1.0, semana_relativa=0)

# ── 3. Instalacion sistema goteo en preparacion — todos ───────────────────────
print('\n=== Instalacion sistema goteo en preparacion ===')
for var in Variedad.objects.all().order_by('cultivo', 'nombre'):
    add_if_missing(var, GOTEO_INS, 'preparacion', 2.0, semana_relativa=0)

# ── 4. Evaluacion fenologica en floracion — perennes ─────────────────────────
PERENNES = [
    'Mango','Palta','Limon','Uva','Maracuya','Papaya',
    'Esparrago','Arandano',
]
print('\n=== Evaluacion fenologica en floracion (perennes) ===')
for cultivo_key in PERENNES:
    for var in Variedad.objects.filter(cultivo__icontains=cultivo_key[:5]):
        add_if_missing(var, EVAL_FEN, 'floracion', 1.0)

# ── Tambien en crecimiento para todos ────────────────────────────────────────
print('\n=== Evaluacion fenologica en crecimiento (todos) ===')
for var in Variedad.objects.all().order_by('cultivo', 'nombre'):
    add_if_missing(var, EVAL_FEN, 'crecimiento', 1.0)

print(f'\n{"="*60}')
print(f'OK: {added} labores nuevas agregadas al PlantillaLabor.')
print(f'Total PlantillaLabor ahora: {PlantillaLabor.objects.count()}')
print(f'{"="*60}')

# Resumen por etapa
from django.db.models import Count
print('\nDistribucion por etapa:')
for row in PlantillaLabor.objects.values('etapa').annotate(n=Count('id')).order_by('etapa'):
    print(f'  {row["etapa"]}: {row["n"]}')
