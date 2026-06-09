"""
Actualización completa de plantillas con enfoque orgánico para Lambayeque, Perú.
- Agrega Biol como producto
- Limpia PlantillaProducto existente
- Re-siembra con biológicos, enmiendas y bioestimulantes por etapa
- Elimina fertilizantes solubles del tab fitosanitario (van en riego)
Ejecutar: python seed_organico_lambayeque.py
"""
import os, sys, django, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import (
    Variedad, ProductoAgricola, PlantillaProducto,
    Objetivo, Condicion, UnidadMedida, Plaga,
)
from decimal import Decimal

# ─────────────────────────────────────────────
# 1. AGREGAR NUEVOS PRODUCTOS ORGANICOS
# ─────────────────────────────────────────────
print('\n═══ Productos ═══')
NUEVOS = [
    ('Biol orgánico foliar',             'bioestimulante', 'mL/L',  0),
    ('Silicio soluble',                  'bioestimulante', 'g/L',   0),
]
for nombre, tipo, unidad, precio in NUEVOS:
    obj, c = ProductoAgricola.objects.get_or_create(
        nombre=nombre,
        defaults={'tipo': tipo, 'unidad': unidad, 'precio_unitario': Decimal(str(precio))}
    )
    print(f'  {"✓ creado" if c else "· existe"}: {nombre}')

# Asegurar Guano de isla existe como enmienda
for nombre in ['Guano de isla', 'Compost orgánico', 'Humus de lombriz',
               'Tierra de diatomeas', 'Carbonato de calcio agrícola']:
    ProductoAgricola.objects.filter(nombre=nombre).update(tipo='enmienda')

# ─────────────────────────────────────────────
# 2. LIMPIAR PLANTILLAPRODUCTO
# ─────────────────────────────────────────────
print('\n═══ Limpiando PlantillaProducto ═══')
n, _ = PlantillaProducto.objects.all().delete()
print(f'  {n} registros eliminados')

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def P(nombre):
    try:    return ProductoAgricola.objects.get(nombre=nombre)
    except: print(f'  [SKIP prod] {nombre}'); return None

def U(codigo):
    try:    return UnidadMedida.objects.get(codigo=codigo)
    except: return None

def O(nombre):
    try:    return Objetivo.objects.get(nombre__icontains=nombre)
    except: return None

def C(nombre):
    try:    return Condicion.objects.get(nombre__icontains=nombre)
    except: return None

prev  = C('Aplicación preventiva')
lluv  = C('humedad alta')
flora = C('floración')

def pp(variedad, etapa, nombre_prod, dosis, unidad_cod,
        objetivo=None, dias_cosecha=None, freq=None, condicion=None):
    prod = P(nombre_prod)
    if not prod: return
    PlantillaProducto.objects.create(
        variedad=variedad, producto=prod, etapa=etapa,
        dosis=Decimal(str(dosis)), unidad=U(unidad_cod),
        objetivo=O(objetivo) if objetivo else None,
        dias_antes_cosecha=dias_cosecha,
        frecuencia_dias=freq,
        condicion=condicion,
    )

def seed(cultivo, variedad_nombre, fn_prods):
    variedades = Variedad.objects.filter(cultivo=cultivo, nombre=variedad_nombre)
    if not variedades.exists():
        # intentar por subtipo
        variedades = Variedad.objects.filter(cultivo=cultivo)
        if not variedades.exists():
            print(f'  [SKIP variedad] {cultivo} {variedad_nombre}')
            return
    for v in variedades:
        fn_prods(v)
    print(f'  ✓ {cultivo} — {variedad_nombre}')

def seed_all(cultivo, fn_prods):
    variedades = Variedad.objects.filter(cultivo=cultivo)
    if not variedades.exists():
        print(f'  [SKIP] {cultivo}')
        return
    for v in variedades:
        fn_prods(v)
    print(f'  ✓ {cultivo} ({variedades.count()} variedades)')


# ══════════════════════════════════════════════════════════
# PROTOCOLO ORGÁNICO LAMBAYEQUE — HORTALIZAS ANUALES
# ══════════════════════════════════════════════════════════

def prods_hortaliza_base(v, con_floracion=True, es_raiz=False):
    """Protocolo base para hortalizas anuales."""
    # PREPARACIÓN — enmiendas al suelo
    pp(v, 'preparacion', 'Compost orgánico',          2.0, 'kg/m²',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'preparacion', 'Humus de lombriz',           1.0, 'kg/m²',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'preparacion', 'Guano de isla',              0.5, 'kg/m²',
       'Fertilización nitrogenada',       None, None, prev)

    # GERMINACIÓN — protección raíces al trasplante
    pp(v, 'germinacion', 'Trichoderma harzianum',      5.0, 'g/L',
       'Prevención de Phytophthora',  None, None, C('trasplante'))
    pp(v, 'germinacion', 'Ácido húmico + fúlvico',     3.0, 'mL/L',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'germinacion', 'Biol orgánico foliar',        5.0, 'mL/L',
       'Bioestimulación y recuperación',  None, None, prev)

    # CRECIMIENTO — control preventivo insectos y hongos
    pp(v, 'crecimiento', 'Beauveria bassiana',          5.0, 'g/L',
       'Control de mosca blanca',     None, 14, prev)
    pp(v, 'crecimiento', 'Bacillus subtilis',           5.0, 'g/L',
       'Prevención general de hongos', None, 14, prev)
    pp(v, 'crecimiento', 'Oxicloruro de cobre 50%',    3.0, 'g/L',
       'Prevención general de hongos', None, 21, lluv)
    pp(v, 'crecimiento', 'Biol orgánico foliar',        5.0, 'mL/L',
       'Bioestimulación y recuperación', None, 14, prev)

    if con_floracion:
        # FLORACIÓN — cuaje, calidad y prevención Botrytis
        pp(v, 'floracion', 'Bacillus subtilis',         5.0, 'g/L',
           'Control de botrytis',      None, 14, flora)
        pp(v, 'floracion', 'Aminoácidos hidrolizados 40%', 2.0, 'mL/L',
           'Mejora de cuaje y llenado', None, 21, prev)
        pp(v, 'floracion', 'Algas marinas Ascophyllum', 2.0, 'mL/L',
           'Mejora de cuaje y llenado', None, 21, prev)


def prods_solacea(v):
    """Tomate, pimiento — agrega trips y ácaro."""
    prods_hortaliza_base(v)
    pp(v, 'crecimiento', 'Spinosad 48% SC',            0.5, 'mL/L',
       'Control de trips',  3, 14, C('Si hay presión'))
    pp(v, 'crecimiento', 'Tierra de diatomeas',        50,  'g/L',
       'Control de trips',  None, None, prev)
    pp(v, 'floracion',   'Ácido giberélico 10%',       0.3, 'mL/L',
       'Mejora de cuaje y llenado', None, None, flora)

def prods_cucurbita(v):
    """Pepino, zapallo — cuaje en cucurbitáceas."""
    prods_hortaliza_base(v)
    pp(v, 'floracion', 'Ácido giberélico 10%',         0.3, 'mL/L',
       'Mejora de cuaje y llenado', None, None, flora)
    pp(v, 'floracion', 'Ácido bórico 17%',             1.5, 'g/L',
       'Mejora de cuaje y llenado', None, None, flora)

def prods_graminia(v):
    """Maíz — cogollero es la amenaza principal."""
    prods_hortaliza_base(v, con_floracion=True)
    pp(v, 'crecimiento', 'Spinosad 48% SC',            0.5, 'mL/L',
       'Control de cogollero', 7, 14, C('Si hay presión'))
    pp(v, 'crecimiento', 'Tierra de diatomeas',       50,   'g/L',
       'Control de gusanos de tierra', None, None, prev)

def prods_papa(v):
    """Papa — Phytophthora (rancha) es la amenaza principal."""
    prods_hortaliza_base(v, con_floracion=True)
    pp(v, 'crecimiento', 'Silicio soluble',            2.0, 'g/L',
       'Prevención de Phytophthora', None, 14, prev)
    pp(v, 'crecimiento', 'Spinosad 48% SC',            0.5, 'mL/L',
       'Control de mosca blanca',  7, 14, C('Si hay presión'))

def prods_cebolla(v):
    prods_hortaliza_base(v, con_floracion=False)
    pp(v, 'crecimiento', 'Spinosad 48% SC',            0.5, 'mL/L',
       'Control de trips', 7, 14, C('Si hay presión'))
    pp(v, 'crecimiento', 'Tierra de diatomeas',       50,   'g/L',
       'Control de trips', None, None, prev)

def prods_hoja(v):
    """Lechuga, espinaca — sin floración comercial."""
    prods_hortaliza_base(v, con_floracion=False)

def prods_raiz(v):
    """Rabanito — ciclo muy corto."""
    pp(v, 'preparacion', 'Compost orgánico',  2.0, 'kg/m²', None, None, None, prev)
    pp(v, 'preparacion', 'Humus de lombriz',  1.0, 'kg/m²', None, None, None, prev)
    pp(v, 'germinacion', 'Trichoderma harzianum', 5.0, 'g/L',
       'Prevención de Phytophthora', None, None, C('trasplante'))
    pp(v, 'crecimiento', 'Bacillus subtilis', 5.0, 'g/L',
       'Prevención general de hongos', None, None, prev)


# ══════════════════════════════════════════════════════════
# PROTOCOLO ORGÁNICO LAMBAYEQUE — FRUTALES PERENNES
# ══════════════════════════════════════════════════════════

def prods_frutal_base(v, con_arandano=False):
    """Protocolo base para frutales perennes."""
    # ESTABLECIDO — nutrición base y raíces
    pp(v, 'establecido', 'Compost orgánico',     2.0, 'kg/m²',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'establecido', 'Guano de isla',         0.5, 'kg/m²',
       'Fertilización nitrogenada', None, None, prev)
    if not con_arandano:
        pp(v, 'establecido', 'Humus de lombriz',  1.0, 'kg/m²',
           'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'establecido', 'Trichoderma harzianum', 5.0, 'g/L',
       'Prevención de Phytophthora', None, None, C('trasplante'))
    pp(v, 'establecido', 'Ácido húmico + fúlvico', 5.0, 'mL/L',
       'Enraizamiento y vigor radicular', None, None, prev)

    # PODA — proteger cortes contra hongos y bacterias
    pp(v, 'poda', 'Oxicloruro de cobre 50%', 3.0, 'g/L',
       'Prevención de bacteriosis', None, None, prev)

    # BROTACIÓN — estimular brotes y raíces
    pp(v, 'brotacion', 'Algas marinas Ascophyllum', 2.0, 'mL/L',
       'Bioestimulación y recuperación', None, None, prev)
    pp(v, 'brotacion', 'Ácido húmico + fúlvico',   3.0, 'mL/L',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'brotacion', 'Biol orgánico foliar',       5.0, 'mL/L',
       'Bioestimulación y recuperación', None, 21, prev)
    pp(v, 'brotacion', 'Beauveria bassiana',          5.0, 'g/L',
       'Control de mosca blanca', None, 21, prev)

    # FLORACIÓN — cuaje y prevención Botrytis
    pp(v, 'floracion', 'Bacillus subtilis',            5.0, 'g/L',
       'Control de botrytis', None, 14, flora)
    pp(v, 'floracion', 'Aminoácidos hidrolizados 40%', 2.0, 'mL/L',
       'Mejora de cuaje y llenado', None, 21, flora)
    pp(v, 'floracion', 'Algas marinas Ascophyllum',    2.0, 'mL/L',
       'Inducción y uniformidad floral', None, None, flora)
    pp(v, 'floracion', 'Ácido bórico 17%',             1.5, 'g/L',
       'Mejora de cuaje y llenado', None, None, flora)

def prods_frutal_cobre(v):
    """Frutales con mayor riesgo de hongos (mango, uva, arándano)."""
    prods_frutal_base(v)
    pp(v, 'crecimiento', 'Oxicloruro de cobre 50%', 3.0, 'g/L',
       'Control de antracnosis', None, 21, lluv)
    pp(v, 'floracion',   'Ácido giberélico 10%',    0.3, 'mL/L',
       'Inducción y uniformidad floral', None, None, flora)

def prods_mango(v):
    prods_frutal_cobre(v)
    pp(v, 'floracion', 'Spinosad 48% SC',   0.5, 'mL/L',
       'Control de trips', 7, 14, flora)

def prods_uva(v):
    prods_frutal_cobre(v)
    pp(v, 'floracion', 'Spinosad 48% SC',   0.5, 'mL/L',
       'Control de trips', 7, 14, flora)
    pp(v, 'floracion', 'Tierra de diatomeas', 50, 'g/L',
       'Control de trips', None, None, flora)

def prods_arandano(v):
    prods_frutal_base(v, con_arandano=True)
    pp(v, 'establecido', 'Carbonato de calcio agrícola', 0.3, 'kg/m²',
       'Enraizamiento y vigor radicular', None, None, prev)
    pp(v, 'crecimiento', 'Oxicloruro de cobre 50%', 3.0, 'g/L',
       'Prevención general de hongos', None, 21, lluv)

def prods_citrico(v):
    prods_frutal_base(v)
    pp(v, 'crecimiento', 'Oxicloruro de cobre 50%', 3.0, 'g/L',
       'Prevención de bacteriosis', None, None, lluv)
    pp(v, 'crecimiento', 'Beauveria bassiana',       5.0, 'g/L',
       'Control de minador de hoja', None, 21, prev)

def prods_papaya(v):
    prods_frutal_base(v)
    pp(v, 'brotacion', 'Beauveria bassiana', 5.0, 'g/L',
       'Control de mosca blanca', None, 14, prev)
    pp(v, 'floracion', 'Ácido giberélico 10%', 0.3, 'mL/L',
       'Mejora de cuaje y llenado', None, None, flora)
    pp(v, 'floracion', 'Spinosad 48% SC',      0.5, 'mL/L',
       'Control de mosca blanca', 7, 14, C('Si hay presión'))

def prods_maracuya(v):
    prods_frutal_base(v)
    pp(v, 'floracion', 'Ácido giberélico 10%', 0.3, 'mL/L',
       'Mejora de cuaje y llenado', None, None, flora)
    pp(v, 'floracion', 'Spinosad 48% SC',       0.5, 'mL/L',
       'Control de trips', 7, 14, C('Si hay presión'))

def prods_esparrago(v):
    prods_frutal_base(v)
    pp(v, 'brotacion', 'Bacillus subtilis', 5.0, 'g/L',
       'Prevención general de hongos', None, 14, prev)
    pp(v, 'floracion',  'Silicio soluble',  2.0, 'g/L',
       'Prevención general de hongos', None, None, prev)


# ══════════════════════════════════════════════════════════
# EJECUTAR POR CULTIVO
# ══════════════════════════════════════════════════════════
print('\n═══ Hortalizas anuales ═══')
seed_all('Lechuga',   prods_hoja)
seed_all('Espinaca',  prods_hoja)
seed_all('Tomate',    prods_solacea)
seed_all('Pimiento',  prods_solacea)
seed_all('Pepino',    prods_cucurbita)
seed_all('Zapallo',   prods_cucurbita)
seed_all('Maíz',      prods_graminia)
seed_all('Cebolla',   prods_cebolla)
seed_all('Frijol',    lambda v: prods_hortaliza_base(v, con_floracion=True))
seed_all('Papa',      prods_papa)
seed_all('Rabanito',  prods_raiz)

print('\n═══ Frutales perennes ═══')
seed_all('Mango',     prods_mango)
seed_all('Palta',     prods_frutal_cobre)
seed_all('Uva',       prods_uva)
seed_all('Limón',     prods_citrico)
seed_all('Arándano',  prods_arandano)
seed_all('Papaya',    prods_papaya)
seed_all('Maracuyá',  prods_maracuya)
seed_all('Espárrago', prods_esparrago)

# ══════════════════════════════════════════════════════════
# RESUMEN
# ══════════════════════════════════════════════════════════
print(f'\n✅ PlantillaProducto: {PlantillaProducto.objects.count()} registros')
from django.db.models import Count
for t in PlantillaProducto.objects.values('producto__tipo').annotate(n=Count('id')).order_by('producto__tipo'):
    print(f'   {t["producto__tipo"]:<15} {t["n"]:>4}')
print(f'\n   Por etapa:')
for e in PlantillaProducto.objects.values('etapa').annotate(n=Count('id')).order_by('etapa'):
    print(f'   {e["etapa"] or "sin etapa":<15} {e["n"]:>4}')
print('\nListo.')
