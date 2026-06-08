"""
Seed de PlantillaProducto + PlantillaLabor usando FKs.
Ejecutar:  python seed_plantillas2.py
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import (
    Variedad, ProductoAgricola, TipoLabor,
    UnidadMedida, Plaga, Objetivo, Condicion,
    PlantillaProducto, PlantillaLabor,
)

PlantillaProducto.objects.all().delete()
PlantillaLabor.objects.all().delete()

# ── cache de lookups ──────────────────────────────────────────────
_u = {u.codigo: u for u in UnidadMedida.objects.all()}
_p = {p.nombre: p for p in Plaga.objects.all()}
_o = {o.nombre: o for o in Objetivo.objects.all()}
_c = {c.nombre: c for c in Condicion.objects.all()}

def U(c): return _u.get(c)
def PL(n): return _p.get(n)
def OB(n): return _o.get(n)
def CO(n): return _c.get(n)

def prod(nombre):
    try:    return ProductoAgricola.objects.get(nombre=nombre)
    except: print(f'  [SKIP] producto: {nombre}'); return None

def labor(codigo):
    try:    return TipoLabor.objects.get(codigo=codigo)
    except: print(f'  [SKIP] labor: {codigo}'); return None

# ── etapa auto-assign ─────────────────────────────────────────────
# Mapeo de código de labor → etapa según ciclo del cultivo
_LABOR_ETAPA_ANUAL = {
    'LB-001': 'preparacion', 'LB-002': 'preparacion',
    'LB-003': 'preparacion', 'LB-022': 'preparacion',
    'LB-004': 'germinacion', 'LB-005': 'germinacion', 'LB-015': 'germinacion',
    'LB-013': 'crecimiento', 'LB-014': 'crecimiento', 'LB-016': 'crecimiento',
    'LB-017': 'crecimiento', 'LB-018': 'crecimiento', 'LB-019': 'crecimiento',
    'LB-020': 'crecimiento', 'LB-021': 'crecimiento', 'LB-023': 'crecimiento',
    'LB-024': 'crecimiento', 'LB-025': 'crecimiento', 'LB-026': 'crecimiento',
    'LB-027': 'crecimiento', 'LB-028': 'crecimiento',
    'LB-011': 'floracion',   'LB-012': 'floracion',
    'LB-029': 'cosecha',     'LB-030': 'cosecha',     'LB-031': 'cosecha',
}
_LABOR_ETAPA_PERENNE = {
    'LB-007': 'poda', 'LB-008': 'poda', 'LB-009': 'poda',
    'LB-010': 'poda', 'LB-011': 'poda',
    'LB-025': 'establecido', 'LB-027': 'establecido',
    'LB-001': 'preparacion', 'LB-002': 'preparacion', 'LB-003': 'preparacion',
    'LB-005': 'brotacion',
    'LB-013': 'brotacion',   'LB-018': 'brotacion',
    'LB-021': 'brotacion',   'LB-022': 'brotacion',
    'LB-014': 'brotacion',   'LB-015': 'brotacion',
    'LB-016': 'brotacion',   'LB-017': 'brotacion',
    'LB-019': 'floracion',   'LB-012': 'floracion',
    'LB-020': 'floracion',   'LB-026': 'floracion',
    'LB-023': 'floracion',   'LB-024': 'floracion',
    'LB-028': 'floracion',
    'LB-029': 'cosecha',     'LB-030': 'cosecha',     'LB-031': 'cosecha',
}

def _etapa_labor(codigo, ciclo):
    m = _LABOR_ETAPA_PERENNE if ciclo == 'perenne' else _LABOR_ETAPA_ANUAL
    return m.get(codigo, 'crecimiento')

def _etapa_prod(obj_k, cond_k, ciclo):
    cond = (cond_k or '').lower()
    obj  = (obj_k  or '').lower()
    if 'floración' in cond or 'floración' in obj:    return 'floracion'
    if 'llenado de frutos' in cond:                  return 'floracion'
    if 'post-cosecha' in cond:                       return 'cosecha'
    if 'trasplante' in cond or 'siembra' in cond:    return 'germinacion' if ciclo == 'anual' else 'brotacion'
    if any(x in obj for x in ['cuaje','llenado','floral','giberél','bioestimulación']):
        return 'floracion'
    if any(x in obj for x in ['potásica','cálcica']) and ciclo == 'anual':
        return 'floracion'
    if any(x in obj for x in ['nitrogenada','fosforada','enraizamiento','mantenimiento','vigor']):
        return 'germinacion' if ciclo == 'anual' else 'brotacion'
    if 'fertirrigación' in obj:
        return 'brotacion' if ciclo == 'perenne' else 'crecimiento'
    return 'crecimiento'

def _save_items(v, productos, labores_list):
    ciclo = v.tipo_ciclo
    for r in productos:
        nombre_prod, obj_k, plaga_k, dosis, unidad_k, dias, freq, cond_k = r
        p = prod(nombre_prod)
        if p:
            PlantillaProducto.objects.create(
                variedad=v, producto=p,
                objetivo=OB(obj_k), plaga=PL(plaga_k),
                dosis=dosis, unidad=U(unidad_k),
                dias_antes_cosecha=dias, frecuencia_dias=freq,
                condicion=CO(cond_k),
                etapa=_etapa_prod(obj_k, cond_k, ciclo),
            )
    for codigo, cantidad, semana, notas in labores_list:
        l = labor(codigo)
        if l:
            PlantillaLabor.objects.create(
                variedad=v, tipo_labor=l,
                cantidad=cantidad, semana_relativa=semana, notas=notas,
                etapa=_etapa_labor(codigo, ciclo),
            )

def seed(cultivo, variedad_nombre, productos, labores_list):
    vs = Variedad.objects.filter(cultivo=cultivo, nombre=variedad_nombre)
    if not vs.exists():
        print(f'  [SKIP] {cultivo} {variedad_nombre}'); return
    for v in vs:
        _save_items(v, productos, labores_list)
        print(f'  OK {v}')

def seed_sub(cultivo, nombre, subtipo, productos, labores_list):
    vs = Variedad.objects.filter(cultivo=cultivo, nombre=nombre, subtipo=subtipo)
    if not vs.exists():
        print(f'  [SKIP] {cultivo} {nombre} {subtipo}'); return
    for v in vs:
        _save_items(v, productos, labores_list)
        print(f'  OK {v}')

# ─── LECHUGA ────────────────────────────────────────────────────────
P_LECHUGA = [
    ('Mancozeb 80% WP',            'Control de mildiu velloso',          'Mildiu velloso',             2.5,  'g/L',   None, 14, 'Con humedad alta o lluvia'),
    ('Deltametrina 2.5% EC',       'Control de pulgones y áfidos',        'Pulgones / áfidos',          0.5,  'mL/L',  7,   10, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Prevención general de hongos',        None,                         1.0,  'mL/L',  None,21, 'Aplicación preventiva'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',               None,                         2.0,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Urea 46%',                   'Fertilización nitrogenada',           None,                         50,   'kg/ha', None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación',     None,                         2.0,  'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_LECHUGA = [
    ('LB-001',1,0,'Subsolado antes de siembra'),('LB-003',1,0,'Formación de camas'),
    ('LB-004',2,0,'Siembra en líneas'),('LB-015',1,1,'Riego de establecimiento'),
    ('LB-023',2,2,'Primer deshierbo'),('LB-026',1,2,'Monitoreo de plagas'),
    ('LB-021',1,3,'Fertilización foliar'),('LB-019',1,4,'Aplicación preventiva fungicida'),
    ('LB-023',2,5,'Segundo deshierbo'),('LB-029',4,8,'Cosecha escalonada'),
]
for v in ['Batavia','Romana']:
    seed('Lechuga', v, P_LECHUGA, L_LECHUGA)

P_LECHUGA_CRESPA = [
    ('Mancozeb 80% WP',            'Control de mildiu velloso',    'Mildiu velloso',    2.5,  'g/L',   None,21,'Con humedad alta o lluvia'),
    ('Deltametrina 2.5% EC',       'Control de minador de hoja',   'Minador de hoja',   0.5,  'mL/L',  7,   14,'Si hay presión de plaga'),
    ('Urea 46%',                   'Fertilización nitrogenada',    None,                60,   'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',        None,                1.0,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación',None,               1.5, 'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_LECHUGA_CRESPA = [
    ('LB-003',1,0,'Camas ligeras'),('LB-004',2,0,'Siembra directa'),
    ('LB-015',1,1,'Riego suave'),('LB-023',2,2,'Deshierbo'),('LB-029',4,7,'Cosecha completa'),
]
for sub in ['Verde','Morada']:
    seed_sub('Lechuga','Crespa',sub,P_LECHUGA_CRESPA,L_LECHUGA_CRESPA)

# ─── TOMATE ─────────────────────────────────────────────────────────
P_TOMATE = [
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja',  'Ácaros (arañita roja)',        0.5, 'mL/L',  3,   14, 'Si hay presión de plaga'),
    ('Imidacloprid 35% SC',        'Control de mosca blanca',           'Mosca blanca',                 0.5, 'mL/L',  7,   21, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de tizón tardío / rancha',  'Tizón tardío / Rancha',        1.0, 'mL/L',  None,14, 'Con humedad alta o lluvia'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',         'Bacteriosis general',          3.0, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',             None,                           2.0, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',           None,                           150, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Cloruro de potasio 60%',     'Fertilización potásica',            None,                           100, 'kg/ha', None,None,'En llenado de frutos'),
    ('Aminoácidos hidrolizados 40%','Mejora de cuaje y llenado',        None,                           2.0, 'mL/L',  None,21, 'Sin restricciones especiales'),
    ('Ácido giberélico 10%',       'Mejora de cuaje y llenado',         None,                           0.3, 'mL/L',  None,None,'En floración (50%)'),
]
L_TOMATE = [
    ('LB-001',1,0,'Subsolado'),('LB-002',1,0,'Rastreado'),('LB-003',1,0,'Formación de surcos'),
    ('LB-022',2,0,'Compost 3 t/ha'),('LB-005',3,1,'Trasplante'),('LB-015',1,1,'Riego post-trasplante'),
    ('LB-013',2,3,'Instalación de tutores'),('LB-023',2,3,'Deshierbo'),('LB-026',1,3,'Monitoreo plagas'),
    ('LB-019',1,4,'Aplicación preventiva'),('LB-021',1,5,'Fertilización foliar'),
    ('LB-012',2,7,'Raleo de frutos'),('LB-019',1,8,'Aplicación fitosanitaria'),
    ('LB-029',5,11,'Cosecha escalonada'),('LB-030',3,11,'Clasificación calibre'),
]
for v in ['Río Grande','Cherry','Momotaro','Larga Vida']:
    seed('Tomate', v, P_TOMATE, L_TOMATE)

# ─── PIMIENTO ───────────────────────────────────────────────────────
P_PIMIENTO = [
    ('Imidacloprid 35% SC',        'Control de trips',                  'Trips',                       0.5, 'mL/L',  7,  21, 'Si hay presión de plaga'),
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja',  'Ácaros (arañita roja)',        0.5, 'mL/L',  3,  14, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de antracnosis',            'Antracnosis',                  1.0, 'mL/L',  None,14,'Aplicación preventiva'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',         'Bacteriosis general',          3.0, 'g/L',   None,21,'Con humedad alta o lluvia'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',             None,                           2.0, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',            None,                           5.0, 'kg/ha', None,None,'En llenado de frutos'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación',   None,                           2.0, 'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_PIMIENTO = [
    ('LB-001',1,0,'Subsolado'),('LB-003',1,0,'Surcos'),('LB-022',2,0,'Materia orgánica'),
    ('LB-005',3,1,'Trasplante'),('LB-015',1,1,'Riego'),('LB-013',2,3,'Tutoraje'),
    ('LB-023',2,4,'Deshierbo'),('LB-026',1,4,'Monitoreo'),('LB-019',1,5,'Aplicación fitosanitaria'),
    ('LB-029',4,11,'Cosecha'),('LB-030',2,11,'Clasificación'),
]
for v in ['California Wonder','Paprika','Piquillo']:
    seed('Pimiento', v, P_PIMIENTO, L_PIMIENTO)

# ─── PEPINO ─────────────────────────────────────────────────────────
P_PEPINO = [
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja','Ácaros (arañita roja)',         0.5, 'mL/L',  3,  14, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de mildiu velloso',       'Mildiu velloso',                1.0, 'mL/L',  None,14,'Aplicación preventiva'),
    ('Imidacloprid 35% SC',        'Control de mosca blanca',         'Mosca blanca',                  0.5, 'mL/L',  7,  21, 'Si hay presión de plaga'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',           None,                            1.5, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Urea 46%',                   'Fertilización nitrogenada',       None,                            80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Mejora de cuaje y llenado',      None,                            2.0, 'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_PEPINO = [
    ('LB-001',1,0,'Preparación'),('LB-004',2,0,'Siembra directa'),
    ('LB-013',2,2,'Espaldera'),('LB-015',1,1,'Riego'),('LB-023',2,3,'Deshierbo'),
    ('LB-026',1,3,'Monitoreo'),('LB-019',1,4,'Fitosanitario'),('LB-029',4,7,'Cosecha escalonada'),
]
for v in ['Largo Verde','Japonés']:
    seed('Pepino', v, P_PEPINO, L_PEPINO)

# ─── ZAPALLO ────────────────────────────────────────────────────────
P_ZAPALLO = [
    ('Imidacloprid 35% SC',        'Control de mosca blanca',          'Mosca blanca',      0.5, 'mL/L',  7,   21, 'Si hay presión de plaga'),
    ('Mancozeb 80% WP',            'Control de mildiu velloso',        'Mildiu velloso',    2.5, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',        'Bacteriosis general',3.0,'g/L',  None,21, 'Con humedad alta o lluvia'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',          None,                120, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Urea 46%',                   'Fertilización nitrogenada',        None,                80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular',  None,                3.0, 'L/ha',  None,None,'Sin restricciones especiales'),
]
L_ZAPALLO = [
    ('LB-001',1,0,'Subsolado'),('LB-002',1,0,'Rastreado'),('LB-004',2,0,'Siembra en golpes'),
    ('LB-015',1,1,'Riego'),('LB-014',2,3,'Aporque'),('LB-023',2,4,'Deshierbo'),
    ('LB-026',1,5,'Monitoreo'),('LB-019',1,5,'Fitosanitario'),('LB-029',3,15,'Cosecha'),
]
for v in ['Macre','Loche']:
    seed('Zapallo', v, P_ZAPALLO, L_ZAPALLO)

# ─── MAÍZ ───────────────────────────────────────────────────────────
P_MAIZ = [
    ('Clorpirifos 48% EC',         'Control de gusanos de tierra',    'Gusano de tierra',  1.0, 'mL/L',  None,None,'Al trasplante o siembra'),
    ('Deltametrina 2.5% EC',       'Control de cogollero',            'Cogollero / Spodoptera',0.5,'mL/L',7,14,'Si hay presión de plaga'),
    ('Oxicloruro de cobre 50%',    'Prevención general de hongos',    None,                 3.0, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Urea 46%',                   'Fertilización nitrogenada',       None,                 150, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',         None,                 120, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Cloruro de potasio 60%',     'Fertilización potásica',          None,                 80,  'kg/ha', None,None,'En llenado de frutos'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular', None,                 3.0, 'L/ha',  None,None,'Sin restricciones especiales'),
]
L_MAIZ = [
    ('LB-001',1,0,'Subsolado'),('LB-002',1,0,'Rastreado'),('LB-003',1,0,'Surcado cada 80 cm'),
    ('LB-004',3,0,'Siembra a 30 cm'),('LB-015',1,1,'Riego'),('LB-021',1,3,'Primera fertilización'),
    ('LB-014',2,4,'Aporque'),('LB-023',2,4,'Deshierbo'),('LB-026',1,5,'Monitoreo cogollero'),
    ('LB-019',1,5,'Aplicación cogollero'),('LB-021',1,7,'Segunda fertilización'),
    ('LB-029',4,17,'Cosecha de choclo/grano'),
]
for v in ['Choclero','Morado','Amarillo duro']:
    seed('Maíz', v, P_MAIZ, L_MAIZ)

# ─── CEBOLLA ────────────────────────────────────────────────────────
P_CEBOLLA = [
    ('Deltametrina 2.5% EC',       'Control de trips',                'Trips',              0.5, 'mL/L',  7,   14, 'Si hay presión de plaga'),
    ('Iprodione 50% WP',           'Control de botrytis',             'Botrytis / Podredumbre gris',2.5,'g/L',None,21,'Si hay presión de enfermedad'),
    ('Mancozeb 80% WP',            'Control de mildiu velloso',       'Mildiu velloso',     2.5, 'g/L',   None,14, 'Con humedad alta o lluvia'),
    ('Urea 46%',                   'Fertilización nitrogenada',       None,                  120, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',         None,                  100, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Sulfato de potasio 50%',     'Fertilización potásica',          None,                  80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Sulfato de magnesio',        'Fertilización foliar NPK',        None,                  30,  'kg/ha', None,None,'Sin restricciones especiales'),
]
L_CEBOLLA = [
    ('LB-001',1,0,'Preparación profunda'),('LB-003',1,0,'Camas'),
    ('LB-005',4,1,'Trasplante de almácigo'),('LB-015',1,1,'Riego'),
    ('LB-023',2,3,'Deshierbo'),('LB-021',1,4,'Fertilización'),
    ('LB-026',1,5,'Monitoreo trips'),('LB-019',1,5,'Control trips'),
    ('LB-014',2,6,'Aporque'),('LB-029',4,16,'Cosecha al doblar cuello'),
    ('LB-030',2,17,'Clasificación'),
]
for v in ['Roja Arequipeña','Amarilla','Blanca']:
    seed('Cebolla', v, P_CEBOLLA, L_CEBOLLA)

# ─── FRIJOL ─────────────────────────────────────────────────────────
P_FRIJOL = [
    ('Deltametrina 2.5% EC',       'Control de pulgones y áfidos',   'Pulgones / áfidos',  0.5, 'mL/L',  7,   14, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de roya',                'Roya',               1.0, 'mL/L',  None,21, 'Si hay presión de enfermedad'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',      'Bacteriosis general', 3.0,'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',        None,                  80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Urea 46%',                   'Fertilización nitrogenada',      None,                  40,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Mejora de cuaje y llenado',     None,                  2.0, 'mL/L',  None,21, 'En floración (50%)'),
]
L_FRIJOL = [
    ('LB-001',1,0,'Preparación'),('LB-004',3,0,'Siembra directa'),
    ('LB-015',1,1,'Riego'),('LB-023',2,3,'Deshierbo'),('LB-026',1,4,'Monitoreo'),
    ('LB-019',1,5,'Fitosanitario'),('LB-029',4,12,'Cosecha de vainas'),
]
for v in ['Castilla','Canario','Loctao']:
    seed('Frijol', v, P_FRIJOL, L_FRIJOL)

# ─── PAPA ───────────────────────────────────────────────────────────
P_PAPA = [
    ('Mancozeb 80% WP',            'Control de tizón tardío / rancha','Tizón tardío / Rancha',2.5,'g/L',  None,7,  'Semanalmente en campaña'),
    ('Azoxystrobin 25% SC',        'Control de tizón tardío / rancha','Tizón tardío / Rancha',1.0,'mL/L', None,14, 'Si hay presión de enfermedad'),
    ('Imidacloprid 35% SC',        'Control de polilla guatemalteca', 'Polilla guatemalteca', 0.5,'mL/L',  7,  21, 'Si hay presión de plaga'),
    ('Clorpirifos 48% EC',         'Control de gusanos de tierra',   'Gusano de tierra',     1.0,'mL/L',  None,None,'Al trasplante o siembra'),
    ('Urea 46%',                   'Fertilización nitrogenada',      None,                    180,'kg/ha', None,None,'Sin restricciones especiales'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',        None,                    150,'kg/ha', None,None,'Sin restricciones especiales'),
    ('Sulfato de potasio 50%',     'Fertilización potásica',         None,                    100,'kg/ha', None,None,'Sin restricciones especiales'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular',None,                    5.0,'L/ha',  None,None,'Sin restricciones especiales'),
]
L_PAPA = [
    ('LB-001',1,0,'Subsolado'),('LB-002',1,0,'Rastreado'),('LB-003',1,0,'Surcado 90 cm'),
    ('LB-022',2,0,'Guano de isla 1 t/ha'),('LB-004',3,0,'Siembra semilla seleccionada'),
    ('LB-015',1,1,'Riego'),('LB-021',1,4,'Primera fertilización'),
    ('LB-014',2,5,'Aporque a 20 cm'),('LB-023',2,5,'Deshierbo'),
    ('LB-026',1,5,'Monitoreo rancha y polilla'),('LB-019',1,5,'Aplicación preventiva rancha'),
    ('LB-021',1,8,'Segunda fertilización'),('LB-014',2,9,'Segundo aporque'),
    ('LB-029',4,17,'Cosecha manual'),('LB-030',2,17,'Clasificación'),
]
for v in ['Canchán','Huayro','Amarilla']:
    seed('Papa', v, P_PAPA, L_PAPA)

# ─── ESPINACA ───────────────────────────────────────────────────────
P_ESPINACA = [
    ('Deltametrina 2.5% EC',        'Control de minador de hoja',    'Minador de hoja',     0.5, 'mL/L',  7,   14, 'Si hay presión de plaga'),
    ('Mancozeb 80% WP',             'Control de mildiu velloso',     'Mildiu velloso',      2.5, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Urea 46%',                    'Fertilización nitrogenada',     None,                   60,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de calcio 15.5%',     'Fertilización cálcica',         None,                   1.0, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación',None,                   1.5, 'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_ESPINACA = [
    ('LB-003',1,0,'Camas'),('LB-004',2,0,'Siembra al voleo'),
    ('LB-015',1,1,'Riego'),('LB-023',1,2,'Deshierbo'),('LB-029',3,6,'Cosecha por corte'),
]
for v in ['Viroflay','Baby leaf']:
    seed('Espinaca', v, P_ESPINACA, L_ESPINACA)

# ─── RABANITO ───────────────────────────────────────────────────────
P_RABANITO = [
    ('Deltametrina 2.5% EC',   'Control de pulgones y áfidos','Pulgones / áfidos',  0.5, 'mL/L',  7,   None,'Si hay presión de plaga'),
    ('Urea 46%',               'Fertilización nitrogenada',   None,                  40,  'kg/ha', None,None, 'Sin restricciones especiales'),
    ('Nitrato de calcio 15.5%','Fertilización cálcica',       None,                  1.0, 'kg/ha', None,None, 'Sin restricciones especiales'),
]
L_RABANITO = [
    ('LB-003',1,0,'Camas'),('LB-004',2,0,'Siembra directa'),
    ('LB-015',1,1,'Riego frecuente'),('LB-023',1,2,'Deshierbo'),('LB-029',2,4,'Cosecha'),
]
for v in ['Crimson Giant','Blanco Largo']:
    seed('Rabanito', v, P_RABANITO, L_RABANITO)

# ─── PALTA (perenne) ────────────────────────────────────────────────
P_PALTA = [
    ('Abamectina 1.8% EC',          'Control de ácaros y arañita roja',  'Ácaros (arañita roja)', 0.5, 'mL/L',  None,21, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',         'Control de antracnosis',            'Antracnosis',           1.0, 'mL/L',  None,21, 'Aplicación preventiva'),
    ('Oxicloruro de cobre 50%',     'Control de Phytophthora en raíz',   'Phytophthora (raíz)',   3.0, 'g/L',   None,None,'Con humedad alta o lluvia'),
    ('Imidacloprid 35% SC',         'Control de trips',                  'Trips',                 0.5, 'mL/L',  7,   21, 'En floración (50%)'),
    ('Nitrato de calcio 15.5%',     'Fertilización cálcica',             None,                    2.0, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de potasio 13-0-46',  'Fertilización potásica',            None,                    5.0, 'kg/ha', None,None,'En llenado de frutos'),
    ('Fosfato diamónico DAP',       'Fertirrigación de mantenimiento',   None,                    80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Sulfato de potasio 50%',      'Fertilización potásica',            None,                    60,  'kg/ha', None,None,'En llenado de frutos'),
    ('Ácido giberélico 10%',        'Inducción y uniformidad floral',    None,                    0.3, 'mL/L',  None,None,'En floración (50%)'),
    ('Algas marinas Ascophyllum',   'Mejora de cuaje y llenado',         None,                    2.0, 'mL/L',  None,None,'Aplicación preventiva'),
    ('Ácido húmico + fúlvico',      'Enraizamiento y vigor radicular',   None,                    5.0, 'L/ha',  None,None,'Sin restricciones especiales'),
]
L_PALTA = [
    ('LB-009',2,2,'Poda formación'),('LB-018',1,0,'Fertirrigación semanal'),
    ('LB-026',1,0,'Monitoreo mensual'),('LB-019',1,2,'Preventivo fungicida'),
    ('LB-021',1,0,'Fertilización foliar'),('LB-025',2,0,'Acolchado bajo copa'),
    ('LB-027',1,0,'Análisis foliar anual'),('LB-029',6,36,'Cosecha calibre 160 g'),
    ('LB-030',3,36,'Clasificación'),('LB-031',2,37,'Empaque exportación'),
]
for v in ['Hass','Fuerte','Zutano']:
    seed('Palta', v, P_PALTA, L_PALTA)

# ─── MANGO (perenne) ────────────────────────────────────────────────
P_MANGO = [
    ('Abamectina 1.8% EC',         'Control de mosca de la fruta',    'Mosca de la fruta', 0.5, 'mL/L',  7,   14, 'Si hay presión de plaga'),
    ('Imidacloprid 35% SC',        'Control de trips',                'Trips',              0.5, 'mL/L',  7,   21, 'En floración (50%)'),
    ('Azoxystrobin 25% SC',        'Control de antracnosis',          'Antracnosis',        1.0, 'mL/L',  None,14, 'Con humedad alta o lluvia'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',       'Bacteriosis general',3.0, 'g/L',   None,21, 'Aplicación preventiva'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',         None,                  5.0, 'kg/ha', None,None,'En llenado de frutos'),
    ('Fosfato diamónico DAP',      'Fertirrigación de mantenimiento', None,                  100, 'kg/ha', None,None,'Post-cosecha'),
    ('Ácido giberélico 10%',       'Inducción y uniformidad floral',  None,                  0.3, 'mL/L',  None,None,'En floración (50%)'),
    ('Algas marinas Ascophyllum',  'Mejora de cuaje y llenado',       None,                  2.0, 'mL/L',  None,None,'Aplicación preventiva'),
]
L_MANGO = [
    ('LB-008',2,1,'Poda mantenimiento'),('LB-009',1,0,'Poda sanitaria'),
    ('LB-018',1,0,'Fertirrigación quincenal'),('LB-019',1,2,'Preventivo fungicida'),
    ('LB-026',1,0,'Monitoreo quincenal'),('LB-025',2,0,'Acolchado'),
    ('LB-029',6,28,'Cosecha con tijera'),('LB-030',3,28,'Clasificación exportación'),
    ('LB-031',2,29,'Empaque cajas 4 kg'),
]
for v in ['Kent','Edward','Haden']:
    seed('Mango', v, P_MANGO, L_MANGO)

# ─── UVA (perenne) ──────────────────────────────────────────────────
P_UVA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja','Ácaros (arañita roja)', 0.5,'mL/L',  3,  14, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de oidio / cenicilla',   'Oidio (cenicilla)',       1.0,'mL/L',  None,7,'Semanalmente en campaña'),
    ('Iprodione 50% WP',           'Control de botrytis',            'Botrytis / Podredumbre gris',2.5,'g/L',None,None,'Con humedad alta o lluvia'),
    ('Imidacloprid 35% SC',        'Control de trips',               'Trips',                   0.5,'mL/L',  7,  21, 'Si hay presión de plaga'),
    ('Ácido giberélico 10%',       'Mejora de cuaje y llenado',      None,                      0.5,'mL/L',  None,None,'En floración (50%)'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',         None,                      5.0,'kg/ha', None,None,'En llenado de frutos'),
    ('Sulfato de potasio 50%',     'Fertilización potásica',         None,                      60, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de calcio 15.5%',    'Fertilización cálcica',          None,                      2.0,'kg/ha', None,None,'Sin restricciones especiales'),
    ('Algas marinas Ascophyllum',  'Bioestimulación y recuperación', None,                      2.0,'mL/L',  None,None,'Sin restricciones especiales'),
]
L_UVA = [
    ('LB-010',2,0,'Poda de renovación'),('LB-009',1,1,'Poda sanitaria'),
    ('LB-013',2,1,'Atado de brotes'),('LB-012',2,4,'Raleo de racimos y bayas'),
    ('LB-011',1,3,'Deshoje para aireación'),('LB-018',1,0,'Fertirrigación semanal'),
    ('LB-026',1,0,'Monitoreo oidio y trips'),('LB-019',1,2,'Preventivo oidio'),
    ('LB-029',6,20,'Cosecha con tijera'),('LB-030',3,20,'Selección racimos'),
    ('LB-031',2,21,'Empaque bolsas SO2'),
]
for v in ['Red Globe','Crimson Seedless','Flame Seedless','Sweet Globe']:
    seed('Uva', v, P_UVA, L_UVA)

# ─── LIMÓN (perenne) ────────────────────────────────────────────────
P_LIMON = [
    ('Abamectina 1.8% EC',         'Control de minador de hoja',     'Minador de hoja',     0.5, 'mL/L',  None,21, 'Si hay presión de plaga'),
    ('Imidacloprid 35% SC',        'Control de trips',               'Trips',               0.5, 'mL/L',  7,   21, 'Si hay presión de plaga'),
    ('Oxicloruro de cobre 50%',    'Prevención de bacteriosis',      'Bacteriosis general', 3.0, 'g/L',   None,None,'Con humedad alta o lluvia'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',         None,                  5.0, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Fosfato diamónico DAP',      'Fertirrigación de mantenimiento',None,                  80,  'kg/ha', None,None,'Post-cosecha'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular',None,                  5.0, 'L/ha',  None,None,'Sin restricciones especiales'),
]
L_LIMON = [
    ('LB-009',2,0,'Poda sanitaria'),('LB-008',1,1,'Poda mantenimiento'),
    ('LB-018',1,0,'Fertirrigación quincenal'),('LB-026',1,0,'Monitoreo mensual'),
    ('LB-019',1,2,'Preventivo'),('LB-029',4,16,'Cosecha verde-amarillo'),
]
for v in ['Sutil','Tahití']:
    seed('Limón', v, P_LIMON, L_LIMON)

# ─── ESPÁRRAGO (perenne) ────────────────────────────────────────────
P_ESPARRAGO = [
    ('Azoxystrobin 25% SC',        'Control de roya',                'Roya',               1.0, 'mL/L',  None,14, 'Si hay presión de enfermedad'),
    ('Deltametrina 2.5% EC',       'Control de pulgones y áfidos',   'Pulgones / áfidos',  0.5, 'mL/L',  7,   14, 'Si hay presión de plaga'),
    ('Mancozeb 80% WP',            'Control de mildiu velloso',      'Mildiu velloso',     2.5, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Fosfato diamónico DAP',      'Fertirrigación de mantenimiento',None,                  100, 'kg/ha', None,None,'Post-cosecha'),
    ('Urea 46%',                   'Fertilización nitrogenada',      None,                  120, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Sulfato de potasio 50%',     'Fertilización potásica',         None,                  80,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular',None,                  5.0, 'L/ha',  None,None,'Post-cosecha'),
]
L_ESPARRAGO = [
    ('LB-018',1,0,'Fertirrigación semanal'),('LB-019',1,2,'Preventivo fungicida'),
    ('LB-026',1,0,'Monitoreo quincenal'),('LB-009',2,0,'Poda sanitaria tallos'),
    ('LB-029',6,0,'Cosecha diaria en ventana productiva'),('LB-030',3,0,'Clasificación calibre'),
    ('LB-031',2,0,'Empaque manojos 1 kg'),('LB-027',1,0,'Análisis de suelo anual'),
]
for v in ['UC-157','Atlas']:
    seed('Espárrago', v, P_ESPARRAGO, L_ESPARRAGO)

# ─── MARACUYÁ (perenne) ─────────────────────────────────────────────
P_MARACUYA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja','Ácaros (arañita roja)',0.5,'mL/L',  3,   14, 'Si hay presión de plaga'),
    ('Azoxystrobin 25% SC',        'Control de antracnosis',          'Antracnosis',          1.0,'mL/L',  None,14, 'Con humedad alta o lluvia'),
    ('Imidacloprid 35% SC',        'Control de mosca de la fruta',    'Mosca de la fruta',    0.5,'mL/L',  7,   21, 'Si hay presión de plaga'),
    ('Fosfato diamónico DAP',      'Fertilización fosforada',         None,                    100,'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',          None,                   5.0, 'kg/ha', None,None,'En llenado de frutos'),
    ('Aminoácidos hidrolizados 40%','Mejora de cuaje y llenado',      None,                   2.0, 'mL/L',  None,21, 'En floración (50%)'),
]
L_MARACUYA = [
    ('LB-007',2,0,'Poda formación espaldera'),('LB-013',2,0,'Mantenimiento espaldera'),
    ('LB-018',1,0,'Fertirrigación'),('LB-026',1,0,'Monitoreo quincenal'),
    ('LB-019',1,2,'Fitosanitario'),('LB-029',4,16,'Cosecha frutos maduros'),
]
for v in ['Amarilla','Morada']:
    seed('Maracuyá', v, P_MARACUYA, L_MARACUYA)

# ─── ARÁNDANO (perenne) ─────────────────────────────────────────────
P_ARANDANO = [
    ('Iprodione 50% WP',           'Control de botrytis',            'Botrytis / Podredumbre gris',2.5,'g/L',None,None,'En floración (50%)'),
    ('Azoxystrobin 25% SC',        'Control de antracnosis',         'Antracnosis',            1.0, 'mL/L',  None,14, 'Si hay presión de enfermedad'),
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja','Ácaros (arañita roja)', 0.5, 'mL/L',  3,   21, 'Si hay presión de plaga'),
    ('Sulfato de potasio 50%',     'Fertilización potásica',         None,                      60,  'kg/ha', None,None,'Sin restricciones especiales'),
    ('Ácido bórico 17%',           'Mejora de cuaje y llenado',      None,                      1.5, 'g/L',   None,None,'En floración (50%)'),
    ('Sulfato de zinc',            'Fertilización foliar NPK',       None,                      2.0, 'g/L',   None,None,'Sin restricciones especiales'),
    ('Ácido húmico + fúlvico',     'Enraizamiento y vigor radicular',None,                      5.0, 'L/ha',  None,None,'Sin restricciones especiales'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación', None,                     2.0, 'mL/L',  None,None,'Post-cosecha'),
]
L_ARANDANO = [
    ('LB-008',2,0,'Poda renovación'),('LB-011',1,1,'Deshoje selectivo'),
    ('LB-018',1,0,'Fertirrigación pH 5.5'),('LB-026',1,0,'Monitoreo botrytis'),
    ('LB-019',1,2,'Preventivo botrytis'),('LB-025',2,0,'Acolchado aserrín de pino'),
    ('LB-027',1,0,'Análisis foliar'),('LB-029',6,16,'Cosecha manual selectiva'),
    ('LB-030',3,16,'Clasificación calibre'),('LB-031',2,17,'Empaque clamshells 125 g'),
]
for v in ['Biloxi','Emerald']:
    seed('Arándano', v, P_ARANDANO, L_ARANDANO)

# ─── PAPAYA (perenne) ───────────────────────────────────────────────
P_PAPAYA = [
    ('Abamectina 1.8% EC',         'Control de ácaros y arañita roja','Ácaros (arañita roja)',0.5, 'mL/L',  3,   14, 'Si hay presión de plaga'),
    ('Imidacloprid 35% SC',        'Control de mosca blanca',         'Mosca blanca',         0.5, 'mL/L',  7,   21, 'Si hay presión de plaga'),
    ('Oxicloruro de cobre 50%',    'Control de antracnosis',          'Antracnosis',          3.0, 'g/L',   None,21, 'Con humedad alta o lluvia'),
    ('Urea 46%',                   'Fertilización nitrogenada',       None,                    120, 'kg/ha', None,None,'Sin restricciones especiales'),
    ('Nitrato de potasio 13-0-46', 'Fertilización potásica',          None,                   5.0, 'kg/ha', None,None,'En llenado de frutos'),
    ('Ácido giberélico 10%',       'Mejora de cuaje y llenado',       None,                   0.3, 'mL/L',  None,None,'En llenado de frutos'),
    ('Aminoácidos hidrolizados 40%','Bioestimulación y recuperación', None,                   2.0, 'mL/L',  None,21, 'Sin restricciones especiales'),
]
L_PAPAYA = [
    ('LB-005',3,1,'Trasplante plantines'),('LB-015',1,1,'Riego post-trasplante'),
    ('LB-018',1,0,'Fertirrigación semanal'),('LB-026',1,0,'Monitoreo mosca blanca'),
    ('LB-019',1,2,'Preventivo'),('LB-009',1,0,'Poda sanitaria hojas viejas'),
    ('LB-029',5,20,'Cosecha frutos maduros'),('LB-030',2,20,'Clasificación'),
]
for v in ['Maradol','Hawaiian Solo']:
    seed('Papaya', v, P_PAPAYA, L_PAPAYA)

# ─── Totales ─────────────────────────────────────────────────────────
print(f'\nPlantillaProducto: {PlantillaProducto.objects.count()} registros')
print(f'PlantillaLabor:    {PlantillaLabor.objects.count()} registros')
