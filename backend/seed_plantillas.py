"""
Seed de plantillas por variedad.
Ejecutar con:  python seed_plantillas.py
(desde la carpeta backend con el venv activado)
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import (
    Variedad, ProductoAgricola, TipoLabor,
    PlantillaProducto, PlantillaLabor,
)

# ── helpers ──────────────────────────────────────────────────────────
def prod(nombre):
    try:    return ProductoAgricola.objects.get(nombre=nombre)
    except: print(f'  [SKIP] producto no encontrado: {nombre}'); return None

def labor(codigo):
    try:    return TipoLabor.objects.get(codigo=codigo)
    except: print(f'  [SKIP] labor no encontrada: {codigo}'); return None

def add_prods(v, items):
    """items = [(nombre_prod, objetivo, dosis, unidad, dias_cosecha, freq_dias, condicion)]"""
    for nombre, objetivo, dosis, unidad, dias, freq, condicion in items:
        p = prod(nombre)
        if p:
            PlantillaProducto.objects.get_or_create(
                variedad=v, producto=p,
                defaults=dict(objetivo=objetivo, dosis=dosis, unidad=unidad,
                              dias_antes_cosecha=dias, frecuencia_dias=freq, condicion=condicion)
            )

def add_labores(v, items):
    """items = [(codigo_labor, cantidad, semana_relativa, notas)]"""
    for codigo, cantidad, semana, notas in items:
        l = labor(codigo)
        if l:
            PlantillaLabor.objects.get_or_create(
                variedad=v, tipo_labor=l,
                defaults=dict(cantidad=cantidad, semana_relativa=semana, notas=notas)
            )

def seed(cultivo_nombre, variedad_nombre, productos, labores_list):
    vs = Variedad.objects.filter(cultivo=cultivo_nombre, nombre=variedad_nombre)
    if not vs.exists():
        print(f'  [SKIP] variedad no encontrada: {cultivo_nombre} {variedad_nombre}')
        return
    for v in vs:
        add_prods(v, productos)
        add_labores(v, labores_list)
        print(f'  ✓ {v.cultivo} — {v.nombre} ({v.subtipo or ""}): {len(productos)} prod, {len(labores_list)} labores')

# ════════════════════════════════════════════════════════════════════
# PLANTILLAS POR CULTIVO
# ════════════════════════════════════════════════════════════════════

print('\n═══ LECHUGAS ═══')
PRODS_LECHUGA = [
    ('Mancozeb 80% WP',           'Control de mildiu velloso',      2.5,  'g/L',   None, 14,   ''),
    ('Deltametrina 2.5% EC',       'Control de pulgones y trips',    0.5,  'mL/L',  7,    10,   ''),
    ('Azoxystrobin 25% SC',        'Control preventivo de hongos',   1.0,  'mL/L',  None, 21,   'si hay humedad alta'),
    ('Nitrato de calcio 15.5%',    'Fertilización calcio-nitrógeno', 2.0,  'kg/ha', None, None, ''),
    ('Urea 46%',                   'Fertilización nitrogenada',      50,   'kg/ha', None, None, ''),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación',2.0,  'mL/L',  None, 21,   ''),
]
LABORES_LECHUGA = [
    ('LB-001', 1, 0,  'Subsolado antes de siembra'),
    ('LB-003', 1, 0,  'Formación de camas de 1m ancho'),
    ('LB-004', 2, 0,  'Siembra directa en líneas'),
    ('LB-015', 1, 1,  'Riego de establecimiento'),
    ('LB-023', 2, 2,  'Primer deshierbo manual'),
    ('LB-026', 1, 2,  'Evaluación de plagas y enfermedades'),
    ('LB-021', 1, 3,  'Fertilización foliar con N'),
    ('LB-019', 1, 4,  'Aplicación preventiva de fungicida'),
    ('LB-023', 2, 5,  'Segundo deshierbo'),
    ('LB-029', 4, 8,  'Cosecha escalonada'),
]
for v in ['Batavia', 'Romana']:
    seed('Lechuga', v, PRODS_LECHUGA, LABORES_LECHUGA)

PRODS_LECHUGA_CRESPA = PRODS_LECHUGA.copy()
LABORES_LECHUGA_CRESPA = [
    ('LB-001', 1, 0, 'Preparación ligera de suelo'),
    ('LB-003', 1, 0, 'Camas altas si hay mucha lluvia'),
    ('LB-004', 2, 0, 'Siembra directa'),
    ('LB-015', 1, 1, 'Riego suave'),
    ('LB-023', 2, 2, 'Deshierbo'),
    ('LB-029', 4, 7, 'Cosecha completa'),
]
for sub in ['Verde', 'Morada']:
    vs = Variedad.objects.filter(cultivo='Lechuga', nombre='Crespa', subtipo=sub)
    for v in vs:
        add_prods(v, PRODS_LECHUGA_CRESPA)
        add_labores(v, LABORES_LECHUGA_CRESPA)
        print(f'  ✓ Lechuga Crespa {sub}: {len(PRODS_LECHUGA_CRESPA)} prod, {len(LABORES_LECHUGA_CRESPA)} labores')

print('\n═══ TOMATES ═══')
PRODS_TOMATE = [
    ('Abamectina 1.8% EC',         'Control de ácaros y minadores',  0.5,  'mL/L',  3,    14,   ''),
    ('Imidacloprid 35% SC',        'Control de mosca blanca y trips', 0.5, 'mL/L',  7,    21,   ''),
    ('Azoxystrobin 25% SC',        'Control de tizón tardío y oidio', 1.0, 'mL/L',  None, 14,   ''),
    ('Oxicloruro de cobre 50%',    'Control bacteriano preventivo',   3.0, 'g/L',   None, 21,   'si hay lluvias'),
    ('Nitrato de calcio 15.5%',    'Prevención podredumbre apical',   2.0, 'kg/ha', None, None, ''),
    ('Fosfato diamónico DAP',      'Fertilización inicio campaña',    150, 'kg/ha', None, None, ''),
    ('Cloruro de potasio 60%',     'Engorde y calidad de fruto',      100, 'kg/ha', None, None, ''),
    ('Aminoácidos hidrolizados 40%','Cuaje y bioestimulación',         2.0, 'mL/L', None, 21,   ''),
    ('Ácido giberélico 10%',       'Mejora de cuaje de frutos',       0.3, 'mL/L',  None, None, 'en floración'),
]
LABORES_TOMATE = [
    ('LB-001', 1, 0,  'Subsolado profundo'),
    ('LB-002', 1, 0,  'Rastreado y nivelación'),
    ('LB-003', 1, 0,  'Formación de surcos'),
    ('LB-022', 2, 0,  'Incorporación de compost 3 t/ha'),
    ('LB-005', 3, 1,  'Trasplante de plantines'),
    ('LB-015', 1, 1,  'Riego post-trasplante'),
    ('LB-013', 2, 3,  'Instalación de tutores'),
    ('LB-023', 2, 3,  'Deshierbo manual'),
    ('LB-026', 1, 3,  'Monitoreo de plagas'),
    ('LB-019', 1, 4,  'Aplicación fitosanitaria preventiva'),
    ('LB-021', 1, 5,  'Fertilización foliar'),
    ('LB-012', 2, 7,  'Raleo de frutos para calibre'),
    ('LB-019', 1, 8,  'Aplicación fitosanitaria'),
    ('LB-029', 5, 11, 'Cosecha escalonada cada 3 días'),
    ('LB-030', 3, 11, 'Clasificación por calibre'),
]
for v in ['Río Grande', 'Cherry', 'Momotaro', 'Larga Vida']:
    seed('Tomate', v, PRODS_TOMATE, LABORES_TOMATE)

print('\n═══ PIMIENTOS ═══')
PRODS_PIMIENTO = [
    ('Imidacloprid 35% SC',        'Control de trips y pulgones',    0.5,  'mL/L',  7,    21,   ''),
    ('Abamectina 1.8% EC',         'Control de ácaros',              0.5,  'mL/L',  3,    14,   ''),
    ('Azoxystrobin 25% SC',        'Control de oidio y antracnosis', 1.0,  'mL/L',  None, 14,   ''),
    ('Oxicloruro de cobre 50%',    'Bacteriosis preventivo',         3.0,  'g/L',   None, 21,   ''),
    ('Nitrato de calcio 15.5%',    'Firmeza y prevención BER',       2.0,  'kg/ha', None, None, ''),
    ('Nitrato de potasio 13-0-46', 'Llenado de frutos',              5.0,  'kg/ha', None, None, ''),
    ('Aminoácidos hidrolizados 40%','Cuaje y bioestimulación',        2.0,  'mL/L',  None, 21,   ''),
]
LABORES_PIMIENTO = [
    ('LB-001', 1, 0,  'Subsolado'),
    ('LB-003', 1, 0,  'Formación de camas o surcos'),
    ('LB-022', 2, 0,  'Incorporación materia orgánica'),
    ('LB-005', 3, 1,  'Trasplante'),
    ('LB-015', 1, 1,  'Riego'),
    ('LB-013', 2, 3,  'Tutoraje'),
    ('LB-023', 2, 4,  'Deshierbo'),
    ('LB-026', 1, 4,  'Monitoreo de plagas'),
    ('LB-019', 1, 5,  'Aplicación fitosanitaria'),
    ('LB-029', 4, 11, 'Cosecha'),
    ('LB-030', 2, 11, 'Clasificación'),
]
for v in ['California Wonder', 'Paprika', 'Piquillo']:
    seed('Pimiento', v, PRODS_PIMIENTO, LABORES_PIMIENTO)

print('\n═══ PEPINOS ═══')
PRODS_PEPINO = [
    ('Abamectina 1.8% EC',         'Control de ácaros y trips',      0.5, 'mL/L',  3,    14,   ''),
    ('Azoxystrobin 25% SC',        'Control de mildiu y oidio',      1.0, 'mL/L',  None, 14,   ''),
    ('Imidacloprid 35% SC',        'Control de mosca blanca',        0.5, 'mL/L',  7,    21,   ''),
    ('Nitrato de calcio 15.5%',    'Firmeza de fruto',               1.5, 'kg/ha', None, None, ''),
    ('Urea 46%',                   'Fertilización nitrogenada',      80,  'kg/ha', None, None, ''),
    ('Aminoácidos hidrolizados 40%','Bioestimulación cuaje',          2.0, 'mL/L',  None, 21,   ''),
]
LABORES_PEPINO = [
    ('LB-001', 1, 0, 'Preparación'),
    ('LB-004', 2, 0, 'Siembra directa 2 semillas por golpe'),
    ('LB-013', 2, 2, 'Instalación de espaldera'),
    ('LB-015', 1, 1, 'Riego'),
    ('LB-023', 2, 3, 'Deshierbo'),
    ('LB-026', 1, 3, 'Monitoreo'),
    ('LB-019', 1, 4, 'Aplicación fitosanitaria'),
    ('LB-029', 4, 7, 'Cosecha escalonada'),
]
for v in ['Largo Verde', 'Japonés']:
    seed('Pepino', v, PRODS_PEPINO, LABORES_PEPINO)

print('\n═══ ZAPALLOS ═══')
PRODS_ZAPALLO = [
    ('Imidacloprid 35% SC',        'Control de mosca blanca y pulgones', 0.5, 'mL/L', 7,  21, ''),
    ('Mancozeb 80% WP',            'Control de mildiu',                  2.5, 'g/L',  None,21, ''),
    ('Oxicloruro de cobre 50%',    'Bacteriosis y mildiu preventivo',    3.0, 'g/L',  None,21, 'si hay lluvias'),
    ('Fosfato diamónico DAP',      'Arranque radicular',                 120, 'kg/ha',None,None,''),
    ('Urea 46%',                   'Fertilización nitrogenada',          80,  'kg/ha',None,None,''),
    ('Ácido húmico + fúlvico',     'Mejora disponibilidad nutrientes',   3.0, 'L/ha', None,None,''),
]
LABORES_ZAPALLO = [
    ('LB-001', 1, 0,  'Subsolado'),
    ('LB-002', 1, 0,  'Rastreado'),
    ('LB-004', 2, 0,  'Siembra en golpes 3 semillas'),
    ('LB-015', 1, 1,  'Riego'),
    ('LB-014', 2, 3,  'Aporque'),
    ('LB-023', 2, 4,  'Deshierbo'),
    ('LB-026', 1, 5,  'Monitoreo'),
    ('LB-019', 1, 5,  'Aplicación fitosanitaria'),
    ('LB-029', 3, 15, 'Cosecha de frutos maduros'),
]
for v in ['Macre', 'Loche']:
    seed('Zapallo', v, PRODS_ZAPALLO, LABORES_ZAPALLO)

print('\n═══ MAÍZ ═══')
PRODS_MAIZ = [
    ('Clorpirifos 48% EC',         'Control de gusano de tierra',    1.0, 'mL/L',  None,None,'al inicio'),
    ('Deltametrina 2.5% EC',       'Control de cogollero',           0.5, 'mL/L',  7,   14,  ''),
    ('Oxicloruro de cobre 50%',    'Enfermedades foliares',          3.0, 'g/L',   None,21,  ''),
    ('Urea 46%',                   'Fertilización nitrogenada',      150, 'kg/ha', None,None,''),
    ('Fosfato diamónico DAP',      'Arranque radicular',             120, 'kg/ha', None,None,''),
    ('Cloruro de potasio 60%',     'Llenado de grano',               80,  'kg/ha', None,None,''),
    ('Ácido húmico + fúlvico',     'Mejora absorción',               3.0, 'L/ha', None, None,''),
]
LABORES_MAIZ = [
    ('LB-001', 1, 0,  'Subsolado o arado'),
    ('LB-002', 1, 0,  'Rastreado'),
    ('LB-003', 1, 0,  'Surcado cada 80 cm'),
    ('LB-004', 3, 0,  'Siembra a 30 cm entre plantas'),
    ('LB-015', 1, 1,  'Riego post-siembra'),
    ('LB-021', 1, 3,  'Primera fertilización'),
    ('LB-014', 2, 4,  'Aporque'),
    ('LB-023', 2, 4,  'Deshierbo'),
    ('LB-026', 1, 5,  'Monitoreo de cogollero'),
    ('LB-019', 1, 5,  'Aplicación si hay cogollero'),
    ('LB-021', 1, 7,  'Segunda fertilización'),
    ('LB-029', 4, 17, 'Cosecha de choclo o grano seco'),
]
for v in ['Choclero', 'Morado', 'Amarillo duro']:
    seed('Maíz', v, PRODS_MAIZ, LABORES_MAIZ)

print('\n═══ CEBOLLA ═══')
PRODS_CEBOLLA = [
    ('Deltametrina 2.5% EC',       'Control de trips y polilla',     0.5, 'mL/L',  7,   14,  ''),
    ('Iprodione 50% WP',           'Control de botrytis y esclerot.',2.5, 'g/L',   None,21,  ''),
    ('Mancozeb 80% WP',            'Control de mildiu',              2.5, 'g/L',   None,14,  ''),
    ('Urea 46%',                   'Fertilización nitrogenada',      120, 'kg/ha', None,None,''),
    ('Fosfato diamónico DAP',      'Fósforo inicio',                 100, 'kg/ha', None,None,''),
    ('Sulfato de potasio 50%',     'Calidad de bulbo sin cloro',     80,  'kg/ha', None,None,''),
    ('Sulfato de magnesio',        'Corrección Mg',                  30,  'kg/ha', None,None,''),
]
LABORES_CEBOLLA = [
    ('LB-001', 1, 0,  'Preparación profunda'),
    ('LB-003', 1, 0,  'Formación de camas'),
    ('LB-005', 4, 1,  'Trasplante de plantines de almácigo'),
    ('LB-015', 1, 1,  'Riego post-trasplante'),
    ('LB-023', 2, 3,  'Deshierbo'),
    ('LB-021', 1, 4,  'Fertilización'),
    ('LB-026', 1, 5,  'Monitoreo trips'),
    ('LB-019', 1, 5,  'Control de trips si supera umbral'),
    ('LB-014', 2, 6,  'Aporque ligero'),
    ('LB-029', 4, 16, 'Cosecha cuando dobla el cuello'),
    ('LB-030', 2, 17, 'Clasificación por calibre'),
]
for v in ['Roja Arequipeña', 'Amarilla', 'Blanca']:
    seed('Cebolla', v, PRODS_CEBOLLA, LABORES_CEBOLLA)

print('\n═══ FRIJOL ═══')
PRODS_FRIJOL = [
    ('Deltametrina 2.5% EC',       'Control de picadores-chupadores', 0.5, 'mL/L', 7,   14, ''),
    ('Azoxystrobin 25% SC',        'Control de roya y antracnosis',   1.0, 'mL/L', None,21, ''),
    ('Oxicloruro de cobre 50%',    'Bacteriosis preventivo',          3.0, 'g/L',  None,21, 'si hay lluvias'),
    ('Fosfato diamónico DAP',      'Arranque y nodulación',           80,  'kg/ha',None,None,''),
    ('Urea 46%',                   'Fertilización complementaria N',  40,  'kg/ha',None,None,''),
    ('Aminoácidos hidrolizados 40%','Cuaje de vainas',                 2.0, 'mL/L', None,21, 'en floración'),
]
LABORES_FRIJOL = [
    ('LB-001', 1, 0, 'Preparación suelo'),
    ('LB-004', 3, 0, 'Siembra directa'),
    ('LB-015', 1, 1, 'Riego'),
    ('LB-023', 2, 3, 'Deshierbo'),
    ('LB-026', 1, 4, 'Monitoreo plagas'),
    ('LB-019', 1, 5, 'Aplicación fitosanitaria'),
    ('LB-029', 4, 12,'Cosecha manual de vainas'),
]
for v in ['Castilla', 'Canario', 'Loctao']:
    seed('Frijol', v, PRODS_FRIJOL, LABORES_FRIJOL)

print('\n═══ PAPA ═══')
PRODS_PAPA = [
    ('Mancozeb 80% WP',            'Control de rancha (Phytophthora)', 2.5, 'g/L',  None,7,  'preventivo semanal'),
    ('Azoxystrobin 25% SC',        'Control sistémico rancha',         1.0, 'mL/L', None,14, 'si hay presión alta'),
    ('Imidacloprid 35% SC',        'Control de polilla y pulgones',    0.5, 'mL/L', 7,   21, ''),
    ('Clorpirifos 48% EC',         'Control gusanos suelo',            1.0, 'mL/L', None,None,'al siembro'),
    ('Urea 46%',                   'Fertilización nitrogenada',        180, 'kg/ha',None,None,''),
    ('Fosfato diamónico DAP',      'Fósforo inicio',                   150, 'kg/ha',None,None,''),
    ('Sulfato de potasio 50%',     'Calidad y almidón del tubérculo',  100, 'kg/ha',None,None,''),
    ('Ácido húmico + fúlvico',     'Mejora estructura suelo y raíces', 5.0, 'L/ha', None,None,''),
]
LABORES_PAPA = [
    ('LB-001', 1, 0,  'Subsolado profundo'),
    ('LB-002', 1, 0,  'Rastreado'),
    ('LB-003', 1, 0,  'Surcado cada 90 cm'),
    ('LB-022', 2, 0,  'Incorporación guano de isla 1 t/ha'),
    ('LB-004', 3, 0,  'Siembra de semilla seleccionada'),
    ('LB-015', 1, 1,  'Riego de establecimiento'),
    ('LB-021', 1, 4,  'Primera fertilización'),
    ('LB-014', 2, 5,  'Aporque a 20 cm'),
    ('LB-023', 2, 5,  'Deshierbo'),
    ('LB-026', 1, 5,  'Monitoreo rancha y polilla'),
    ('LB-019', 1, 5,  'Aplicación preventiva rancha'),
    ('LB-021', 1, 8,  'Segunda fertilización'),
    ('LB-014', 2, 9,  'Segundo aporque'),
    ('LB-029', 4, 17, 'Cosecha manual'),
    ('LB-030', 2, 17, 'Clasificación y selección'),
]
for v in ['Canchán', 'Huayro', 'Amarilla']:
    seed('Papa', v, PRODS_PAPA, LABORES_PAPA)

print('\n═══ ESPINACA ═══')
PRODS_ESPINACA = [
    ('Deltametrina 2.5% EC',        'Control de minador de hoja',    0.5, 'mL/L', 7,   14, ''),
    ('Mancozeb 80% WP',             'Control de mildiu',             2.5, 'g/L',  None,21, ''),
    ('Urea 46%',                    'Fertilización nitrogenada',     60,  'kg/ha',None,None,''),
    ('Nitrato de calcio 15.5%',     'Calidad foliar',                1.0, 'kg/ha',None,None,''),
    ('Aminoácidos hidrolizados 40%', 'Bioestimulación',              1.5, 'mL/L', None,21, ''),
]
LABORES_ESPINACA = [
    ('LB-003', 1, 0, 'Preparación de camas'),
    ('LB-004', 2, 0, 'Siembra al voleo o en líneas'),
    ('LB-015', 1, 1, 'Riego'),
    ('LB-023', 1, 2, 'Deshierbo'),
    ('LB-029', 3, 6, 'Cosecha por corte'),
]
for v in ['Viroflay', 'Baby leaf']:
    seed('Espinaca', v, PRODS_ESPINACA, LABORES_ESPINACA)

print('\n═══ RABANITO ═══')
PRODS_RABANITO = [
    ('Deltametrina 2.5% EC',   'Control de pulguilla de hoja', 0.5, 'mL/L', 7,  None,''),
    ('Urea 46%',               'Fertilización nitrogenada',    40,  'kg/ha',None,None,''),
    ('Nitrato de calcio 15.5%','Firmeza de raíz',              1.0, 'kg/ha',None,None,''),
]
LABORES_RABANITO = [
    ('LB-003', 1, 0, 'Camas ligeras'),
    ('LB-004', 2, 0, 'Siembra directa'),
    ('LB-015', 1, 1, 'Riego frecuente'),
    ('LB-023', 1, 2, 'Deshierbo'),
    ('LB-029', 2, 4, 'Cosecha completa'),
]
for v in ['Crimson Giant', 'Blanco Largo']:
    seed('Rabanito', v, PRODS_RABANITO, LABORES_RABANITO)

print('\n═══ PALTA (perenne) ═══')
PRODS_PALTA = [
    ('Abamectina 1.8% EC',          'Control de ácaros y trips',         0.5, 'mL/L',  None,21,  ''),
    ('Azoxystrobin 25% SC',         'Control de antracnosis y podredumbre',1.0,'mL/L',  None,21,  ''),
    ('Oxicloruro de cobre 50%',     'Control preventivo Phytophthora',   3.0, 'g/L',   None,None,'en inicio lluvias'),
    ('Imidacloprid 35% SC',         'Control de trips de flores',        0.5, 'mL/L',  7,   21,  'en floración'),
    ('Nitrato de calcio 15.5%',     'Llenado y firmeza de fruto',        2.0, 'kg/ha', None,None,''),
    ('Nitrato de potasio 13-0-46',  'Calidad y peso de fruto',           5.0, 'kg/ha', None,None,''),
    ('Fosfato diamónico DAP',       'Fertilización de mantenimiento',    80,  'kg/ha', None,None,''),
    ('Sulfato de potasio 50%',      'Engorde de fruto',                  60,  'kg/ha', None,None,''),
    ('Ácido giberélico 10%',        'Uniformidad de cuaje',              0.3, 'mL/L',  None,None,'en floración 50%'),
    ('Algas marinas Ascophyllum',   'Estimulación de cuaje',             2.0, 'mL/L',  None,None,'pre y post floración'),
    ('Ácido húmico + fúlvico',      'Activación de raíces',              5.0, 'L/ha',  None,None,''),
]
LABORES_PALTA = [
    ('LB-009', 2, 2,  'Poda de formación de estructura'),
    ('LB-018', 1, 0,  'Fertirrigación semanal mantenimiento'),
    ('LB-026', 1, 0,  'Monitoreo mensual de plagas'),
    ('LB-019', 1, 2,  'Aplicación preventiva fungicida'),
    ('LB-021', 1, 0,  'Fertilización foliar mensual'),
    ('LB-025', 2, 0,  'Acolchado bajo la copa'),
    ('LB-027', 1, 0,  'Análisis foliar anual'),
    ('LB-029', 6, 36, 'Cosecha calibre mínimo 160 g'),
    ('LB-030', 3, 36, 'Clasificación por calibre'),
    ('LB-031', 2, 37, 'Empaque para exportación'),
]
for v in ['Hass', 'Fuerte', 'Zutano']:
    seed('Palta', v, PRODS_PALTA, LABORES_PALTA)

print('\n═══ MANGO (perenne) ═══')
PRODS_MANGO = [
    ('Abamectina 1.8% EC',         'Control de mosca de la fruta',   0.5, 'mL/L',  7,   14, ''),
    ('Imidacloprid 35% SC',        'Control de trips en flores',     0.5, 'mL/L',  7,   21, 'en floración'),
    ('Azoxystrobin 25% SC',        'Control de antracnosis',         1.0, 'mL/L',  None,14, ''),
    ('Oxicloruro de cobre 50%',    'Control bacteriano y mildiu',    3.0, 'g/L',   None,21, ''),
    ('Nitrato de potasio 13-0-46', 'Engorde y azúcar de fruto',     5.0, 'kg/ha', None,None,''),
    ('Fosfato diamónico DAP',      'Fertilización post-cosecha',    100, 'kg/ha', None,None,''),
    ('Ácido giberélico 10%',       'Uniformidad de floración',       0.3, 'mL/L',  None,None,'en inducción floral'),
    ('Algas marinas Ascophyllum',  'Estimulación floral',            2.0, 'mL/L',  None,None,'pre-floración'),
]
LABORES_MANGO = [
    ('LB-008', 2, 1,  'Poda de mantenimiento post-cosecha'),
    ('LB-009', 1, 0,  'Poda sanitaria de ramas secas'),
    ('LB-018', 1, 0,  'Fertirrigación quincenal'),
    ('LB-019', 1, 2,  'Aplicación fitosanitaria preventiva'),
    ('LB-026', 1, 0,  'Monitoreo quincenal de plagas'),
    ('LB-025', 2, 0,  'Acolchado bajo la copa'),
    ('LB-029', 6, 28, 'Cosecha manual con tijera'),
    ('LB-030', 3, 28, 'Clasificación calibre exportación'),
    ('LB-031', 2, 29, 'Empaque cajas cartón 4 kg'),
]
for v in ['Kent', 'Edward', 'Haden']:
    seed('Mango', v, PRODS_MANGO, LABORES_MANGO)

print('\n═══ UVA (perenne) ═══')
PRODS_UVA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y trips',      0.5, 'mL/L',  3,   14,  ''),
    ('Azoxystrobin 25% SC',        'Control de oidio y botrytis',    1.0, 'mL/L',  None,7,   ''),
    ('Iprodione 50% WP',           'Control de botrytis en racimos', 2.5, 'g/L',   None,None,'antes de cierre racimo'),
    ('Imidacloprid 35% SC',        'Control de trips',               0.5, 'mL/L',  7,   21,  ''),
    ('Ácido giberélico 10%',       'Elongación de racimos y calibre',0.5, 'mL/L',  None,None,'en cuaje'),
    ('Nitrato de potasio 13-0-46', 'Coloración y azúcar de baya',    5.0, 'kg/ha', None,None,''),
    ('Sulfato de potasio 50%',     'Calidad postcosecha sin cloro',  60,  'kg/ha', None,None,''),
    ('Nitrato de calcio 15.5%',    'Firmeza de baya',                2.0, 'kg/ha', None,None,''),
    ('Algas marinas Ascophyllum',  'Uniformidad de bayas',           2.0, 'mL/L',  None,None,''),
]
LABORES_UVA = [
    ('LB-010', 2, 0,  'Poda de renovación en invierno'),
    ('LB-009', 1, 1,  'Poda sanitaria'),
    ('LB-013', 2, 1,  'Atado de brotes nuevos'),
    ('LB-012', 2, 4,  'Raleo de racimos y bayas'),
    ('LB-011', 1, 3,  'Deshoje para aireación de racimos'),
    ('LB-018', 1, 0,  'Fertirrigación semanal'),
    ('LB-026', 1, 0,  'Monitoreo semanal de oidio y trips'),
    ('LB-019', 1, 2,  'Aplicación preventiva oidio'),
    ('LB-029', 6, 20, 'Cosecha manual con tijera'),
    ('LB-030', 3, 20, 'Selección de racimos export'),
    ('LB-031', 2, 21, 'Empaque en cajas con bolsas SO2'),
]
for v in ['Red Globe', 'Crimson Seedless', 'Flame Seedless', 'Sweet Globe']:
    seed('Uva', v, PRODS_UVA, LABORES_UVA)

print('\n═══ LIMÓN (perenne) ═══')
PRODS_LIMON = [
    ('Abamectina 1.8% EC',         'Control de minador de hoja',     0.5, 'mL/L',  None,21,  ''),
    ('Imidacloprid 35% SC',        'Control de trips y pulgones',    0.5, 'mL/L',  7,   21,  ''),
    ('Oxicloruro de cobre 50%',    'Control de gomosis y cancros',   3.0, 'g/L',   None,None,'preventivo lluvia'),
    ('Nitrato de potasio 13-0-46', 'Calidad y jugosidad del fruto',  5.0, 'kg/ha', None,None,''),
    ('Fosfato diamónico DAP',      'Mantenimiento post-cosecha',     80,  'kg/ha', None,None,''),
    ('Ácido húmico + fúlvico',     'Activación de raíces',           5.0, 'L/ha',  None,None,''),
]
LABORES_LIMON = [
    ('LB-009', 2, 0,  'Poda sanitaria permanente'),
    ('LB-008', 1, 1,  'Poda de mantenimiento'),
    ('LB-018', 1, 0,  'Fertirrigación quincenal'),
    ('LB-026', 1, 0,  'Monitoreo mensual de plagas'),
    ('LB-019', 1, 2,  'Aplicación fitosanitaria preventiva'),
    ('LB-029', 4, 16, 'Cosecha de fruta en punto verde-amarillo'),
]
for v in ['Sutil', 'Tahití']:
    seed('Limón', v, PRODS_LIMON, LABORES_LIMON)

print('\n═══ ESPÁRRAGO (perenne) ═══')
PRODS_ESPARRAGO = [
    ('Azoxystrobin 25% SC',        'Control de roya y Stemphylium',  1.0, 'mL/L',  None,14,  ''),
    ('Deltametrina 2.5% EC',       'Control de pulgones y trips',    0.5, 'mL/L',  7,   14,  ''),
    ('Mancozeb 80% WP',            'Control de tizón foliar',        2.5, 'g/L',   None,21,  ''),
    ('Fosfato diamónico DAP',      'Fertilización post-cosecha',     100, 'kg/ha', None,None,''),
    ('Urea 46%',                   'Fertilización nitrogenada',      120, 'kg/ha', None,None,''),
    ('Sulfato de potasio 50%',     'Calidad de turión sin cloro',    80,  'kg/ha', None,None,''),
    ('Ácido húmico + fúlvico',     'Recuperación del sistema radicular',5.0,'L/ha',None,None,''),
]
LABORES_ESPARRAGO = [
    ('LB-018', 1, 0,  'Fertirrigación semanal en producción'),
    ('LB-019', 1, 2,  'Aplicación preventiva fungicida'),
    ('LB-026', 1, 0,  'Monitoreo quincenal'),
    ('LB-009', 2, 0,  'Poda sanitaria de tallos'),
    ('LB-029', 6, 0,  'Cosecha diaria en ventana productiva'),
    ('LB-030', 3, 0,  'Clasificación por calibre'),
    ('LB-031', 2, 0,  'Empaque en manojos 1 kg'),
    ('LB-027', 1, 0,  'Análisis de suelo anual'),
]
for v in ['UC-157', 'Atlas']:
    seed('Espárrago', v, PRODS_ESPARRAGO, LABORES_ESPARRAGO)

print('\n═══ MARACUYÁ (perenne) ═══')
PRODS_MARACUYA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y trips',       0.5, 'mL/L',  3,   14,  ''),
    ('Azoxystrobin 25% SC',        'Control de antracnosis y mildiu', 1.0, 'mL/L',  None,14,  ''),
    ('Imidacloprid 35% SC',        'Control de mosca de la fruta',    0.5, 'mL/L',  7,   21,  ''),
    ('Fosfato diamónico DAP',      'Fertilización inicio de campaña', 100, 'kg/ha', None,None,''),
    ('Nitrato de potasio 13-0-46', 'Llenado y azúcar del fruto',      5.0, 'kg/ha', None,None,''),
    ('Aminoácidos hidrolizados 40%','Cuaje y llenado de frutos',       2.0, 'mL/L',  None,21,  ''),
]
LABORES_MARACUYA = [
    ('LB-007', 2, 0,  'Poda de formación en espaldera'),
    ('LB-013', 2, 0,  'Mantenimiento de espaldera y atado'),
    ('LB-018', 1, 0,  'Fertirrigación'),
    ('LB-026', 1, 0,  'Monitoreo quincenal'),
    ('LB-019', 1, 2,  'Aplicación fitosanitaria'),
    ('LB-029', 4, 16, 'Cosecha de frutos maduros caídos'),
]
for v in ['Amarilla', 'Morada']:
    seed('Maracuyá', v, PRODS_MARACUYA, LABORES_MARACUYA)

print('\n═══ ARÁNDANO (perenne) ═══')
PRODS_ARANDANO = [
    ('Iprodione 50% WP',           'Control de botrytis en flor',     2.5, 'g/L',   None,None,'en floración'),
    ('Azoxystrobin 25% SC',        'Control de momifia y antracnosis',1.0, 'mL/L',  None,14,  ''),
    ('Abamectina 1.8% EC',         'Control de ácaros',               0.5, 'mL/L',  3,   21,  ''),
    ('Sulfato de potasio 50%',     'Calidad y firmeza de baya',       60,  'kg/ha', None,None,''),
    ('Ácido bórico 17%',           'Cuaje y llenado de bayas',        1.5, 'g/L',   None,None,'en floración'),
    ('Sulfato de zinc',            'Corrección de deficiencias Zn',   2.0, 'g/L',   None,None,''),
    ('Ácido húmico + fúlvico',     'Mantenimiento pH ácido del suelo',5.0, 'L/ha',  None,None,''),
    ('Aminoácidos hidrolizados 40%','Post-cosecha y recuperación',     2.0, 'mL/L',  None,None,''),
]
LABORES_ARANDANO = [
    ('LB-008', 2, 0,  'Poda de renovación post-cosecha'),
    ('LB-011', 1, 1,  'Deshoje selectivo para aireación'),
    ('LB-018', 1, 0,  'Fertirrigación con solución ácida pH 5.5'),
    ('LB-026', 1, 0,  'Monitoreo semanal de botrytis'),
    ('LB-019', 1, 2,  'Aplicación preventiva botrytis'),
    ('LB-025', 2, 0,  'Acolchado con aserrín de pino'),
    ('LB-027', 1, 0,  'Análisis foliar y de suelo'),
    ('LB-029', 6, 16, 'Cosecha manual selectiva'),
    ('LB-030', 3, 16, 'Clasificación por calibre'),
    ('LB-031', 2, 17, 'Empaque en clamshells de 125 g'),
]
for v in ['Biloxi', 'Emerald']:
    seed('Arándano', v, PRODS_ARANDANO, LABORES_ARANDANO)

print('\n═══ PAPAYA (perenne) ═══')
PRODS_PAPAYA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y trips',       0.5, 'mL/L',  3,   14,  ''),
    ('Imidacloprid 35% SC',        'Control de mosca blanca vectora', 0.5, 'mL/L',  7,   21,  'previene virosis'),
    ('Oxicloruro de cobre 50%',    'Control de antracnosis y bacterios',3.0,'g/L',  None,21,  ''),
    ('Urea 46%',                   'Fertilización nitrogenada',        120, 'kg/ha',None,None,''),
    ('Nitrato de potasio 13-0-46', 'Dulzura y peso de fruto',          5.0, 'kg/ha',None,None,''),
    ('Ácido giberélico 10%',       'Uniformidad y tamaño de fruto',    0.3, 'mL/L', None,None,'en llenado'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación crecimiento',      2.0, 'mL/L', None,21,  ''),
]
LABORES_PAPAYA = [
    ('LB-005', 3, 1,  'Trasplante de plantines'),
    ('LB-015', 1, 1,  'Riego post-trasplante'),
    ('LB-018', 1, 0,  'Fertirrigación semanal'),
    ('LB-026', 1, 0,  'Monitoreo semanal mosca blanca y virosis'),
    ('LB-019', 1, 2,  'Aplicación preventiva'),
    ('LB-009', 1, 0,  'Poda sanitaria de hojas viejas'),
    ('LB-029', 5, 20, 'Cosecha escalonada de frutos maduros'),
    ('LB-030', 2, 20, 'Clasificación'),
]
for v in ['Maradol', 'Hawaiian Solo']:
    seed('Papaya', v, PRODS_PAPAYA, LABORES_PAPAYA)

# ─── Totales ──────────────────────────────────────────────────────────
from apps.campanas.models import PlantillaProducto, PlantillaLabor
print(f'\n✅ Carga completada:')
print(f'   PlantillaProducto: {PlantillaProducto.objects.count()} registros')
print(f'   PlantillaLabor:    {PlantillaLabor.objects.count()} registros')
