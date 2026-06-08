"""
Seed de UnidadMedida, Plaga, Objetivo y Condicion.
Ejecutar:  python seed_catalogos2.py
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import UnidadMedida, Plaga, Objetivo, Condicion

def uo(model, **kw):
    obj, created = model.objects.get_or_create(**kw)
    return obj

# ── Unidades de medida ────────────────────────────────────────────
print('--- Unidades de medida ---')
UNIDADES = [
    ('mL/L',   'Mililitros por litro de agua',    'vol_vol'),
    ('mL/ha',  'Mililitros por hectárea',          'vol_area'),
    ('L/ha',   'Litros por hectárea',              'vol_area'),
    ('g/L',    'Gramos por litro de agua',         'masa_vol'),
    ('g/ha',   'Gramos por hectárea',              'masa_area'),
    ('kg/ha',  'Kilogramos por hectárea',          'masa_area'),
    ('t/ha',   'Toneladas por hectárea',           'masa_area'),
    ('kg/m²',  'Kilogramos por metro cuadrado',    'masa_area'),
    ('mL/m²',  'Mililitros por metro cuadrado',    'vol_area'),
    ('unid.',  'Unidades',                         'unidades'),
]
for codigo, nombre, tipo in UNIDADES:
    obj, c = UnidadMedida.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre, 'tipo': tipo})
    print(f'  {"✓" if c else "·"} {codigo}')

# ── Plagas y enfermedades ─────────────────────────────────────────
print('\n--- Plagas / enfermedades ---')
PLAGAS = [
    ('Mosca blanca',              'Bemisia tabaci',          'insecto',  'Vector de virus; ataca a casi todos los cultivos'),
    ('Pulgones / áfidos',         'Myzus persicae spp.',     'insecto',  'Chupadores; transmiten virus'),
    ('Trips',                     'Frankliniella spp.',      'insecto',  'Daña flores, frutos y hojas; vector de TSWV'),
    ('Minador de hoja',           'Liriomyza spp.',          'insecto',  'Larvas minan el mesófilo foliar'),
    ('Cogollero / Spodoptera',    'Spodoptera frugiperda',   'insecto',  'Larva barrena el cogollo de maíz y gramíneas'),
    ('Gusano de tierra',          'Agrotis spp.',            'insecto',  'Corta plantas en la base al nivel del suelo'),
    ('Mosca de la fruta',         'Ceratitis capitata',      'insecto',  'Larva destruye frutos de mango, cítricos y palta'),
    ('Polilla guatemalteca',      'Tecia solanivora',        'insecto',  'Barrena tubérculos de papa en almacén y campo'),
    ('Pulguilla de hoja',         'Epitrix cucumeris',       'insecto',  'Pequeños agujeros en hojas de crucíferas'),
    ('Ácaros (arañita roja)',     'Tetranychus urticae',     'acaro',    'Succión de savia; seda fina en envés de hoja'),
    ('Ácaros del bronceado',      'Aceria lycopersici',      'acaro',    'Bronceado y rugosidad foliar en solanáceas'),
    ('Mildiu velloso',            'Plasmopara / Bremia',     'hongo',    'Manchas amarillas con esporulación blanquecina en envés'),
    ('Oidio (cenicilla)',         'Erysiphe / Leveillula',   'hongo',    'Polvo blanquecino en hojas y tallos'),
    ('Botrytis / Podredumbre gris','Botrytis cinerea',       'hongo',    'Pudrición suave grisácea; favorecida por humedad alta'),
    ('Tizón tardío / Rancha',     'Phytophthora infestans',  'hongo',    'Manchas acuosas oscuras; destruye foliaje en días'),
    ('Antracnosis',               'Colletotrichum spp.',     'hongo',    'Manchas oscuras hundidas en frutos y tallos'),
    ('Fusarium (marchitez)',      'Fusarium oxysporum',      'hongo',    'Marchitez vascular; oscurecimiento interno del tallo'),
    ('Roya',                      'Puccinia spp.',           'hongo',    'Pústulas anaranjadas o marrones en hojas'),
    ('Phytophthora (raíz)',       'Phytophthora cinnamomi',  'hongo',    'Pudrición de raíces; frecuente en palta y espárrago'),
    ('Alternaria',                'Alternaria solani',       'hongo',    'Manchas concéntricas en hojas de solanáceas'),
    ('Bacteriosis general',       '',                        'bacteria', 'Cancros, podredumbres suaves o marchitez bacteriana'),
    ('Xanthomonas (cancro)',      'Xanthomonas axonopodis',  'bacteria', 'Lesiones angulosas con halo amarillo en cítricos'),
    ('Virosis (mosaico / TYLCV)', '',                        'virus',    'Mosaico, deformación foliar; control por vectores'),
    ('Nematodos de nudo',         'Meloidogyne spp.',        'nematodo', 'Agallas en raíces; reducción del crecimiento'),
]
plagas_obj = {}
for nombre, nc, tipo, desc in PLAGAS:
    obj, c = Plaga.objects.get_or_create(nombre=nombre, defaults={'nombre_cientifico': nc, 'tipo': tipo, 'descripcion': desc})
    plagas_obj[nombre] = obj
    print(f'  {"✓" if c else "·"} [{tipo:9s}] {nombre}')

# ── Objetivos ─────────────────────────────────────────────────────
print('\n--- Objetivos ---')
def P(n):
    return plagas_obj.get(n)

OBJETIVOS = [
    # control
    ('Control de mosca blanca',          'control',       P('Mosca blanca')),
    ('Control de pulgones y áfidos',     'control',       P('Pulgones / áfidos')),
    ('Control de trips',                 'control',       P('Trips')),
    ('Control de minador de hoja',       'control',       P('Minador de hoja')),
    ('Control de cogollero',             'control',       P('Cogollero / Spodoptera')),
    ('Control de gusanos de tierra',     'control',       P('Gusano de tierra')),
    ('Control de mosca de la fruta',     'control',       P('Mosca de la fruta')),
    ('Control de polilla guatemalteca',  'control',       P('Polilla guatemalteca')),
    ('Control de ácaros y arañita roja', 'control',       P('Ácaros (arañita roja)')),
    ('Control de mildiu velloso',        'control',       P('Mildiu velloso')),
    ('Control de oidio / cenicilla',     'control',       P('Oidio (cenicilla)')),
    ('Control de botrytis',              'control',       P('Botrytis / Podredumbre gris')),
    ('Control de tizón tardío / rancha', 'control',       P('Tizón tardío / Rancha')),
    ('Control de antracnosis',           'control',       P('Antracnosis')),
    ('Control de fusarium y marchitez',  'control',       P('Fusarium (marchitez)')),
    ('Control de roya',                  'control',       P('Roya')),
    ('Control de Phytophthora en raíz',  'control',       P('Phytophthora (raíz)')),
    ('Control de bacteriosis',           'control',       P('Bacteriosis general')),
    ('Control de virosis (vectores)',     'control',       P('Virosis (mosaico / TYLCV)')),
    ('Control de nematodos',             'control',       P('Nematodos de nudo')),
    # prevención
    ('Prevención general de hongos',     'prevencion',    None),
    ('Prevención de bacteriosis',        'prevencion',    P('Bacteriosis general')),
    ('Prevención de Phytophthora',       'prevencion',    P('Phytophthora (raíz)')),
    # fertilización
    ('Fertilización nitrogenada',        'fertilizacion', None),
    ('Fertilización fosforada',          'fertilizacion', None),
    ('Fertilización potásica',           'fertilizacion', None),
    ('Fertilización cálcica',            'fertilizacion', None),
    ('Fertilización foliar NPK',         'fertilizacion', None),
    ('Fertirrigación de mantenimiento',  'fertilizacion', None),
    # bioestimulación
    ('Bioestimulación y recuperación',   'estimulacion',  None),
    ('Mejora de cuaje y llenado',        'estimulacion',  None),
    ('Inducción y uniformidad floral',   'estimulacion',  None),
    ('Enraizamiento y vigor radicular',  'estimulacion',  None),
]
objetivos_obj = {}
for nombre, tipo, plaga in OBJETIVOS:
    defaults = {'tipo': tipo}
    if plaga:
        defaults['plaga'] = plaga
    obj, c = Objetivo.objects.get_or_create(nombre=nombre, defaults=defaults)
    objetivos_obj[nombre] = obj
    print(f'  {"✓" if c else "·"} [{tipo:14s}] {nombre}')

# ── Condiciones de aplicación ─────────────────────────────────────
print('\n--- Condiciones ---')
CONDICIONES = [
    ('Aplicación preventiva',            'Antes de que aparezcan síntomas, en calendario fijo'),
    ('Si hay presión de plaga',          'Solo cuando el conteo supera el umbral económico de daño'),
    ('Si hay presión de enfermedad',     'Solo cuando hay condiciones favorables o síntomas iniciales'),
    ('En floración (50%)',               'Aplicar cuando el 50% de las flores están abiertas'),
    ('Con humedad alta o lluvia',        'Aplicar al inicio de periodos lluviosos o con >80% HR'),
    ('En llenado de frutos',             'Durante la fase de engorde y llenado del fruto'),
    ('Post-cosecha',                     'Inmediatamente después de realizada la cosecha'),
    ('Al trasplante o siembra',          'Una sola aplicación en el momento de establecimiento del cultivo'),
    ('Semanalmente en campaña',          'Aplicación semanal durante todo el ciclo productivo'),
    ('Quincenalmente',                   'Cada 14-15 días durante el ciclo productivo'),
    ('Mensualmente',                     'Una vez al mes como mantenimiento'),
    ('Solo si hay síntomas visibles',    'Aplicación curativa ante síntomas confirmados'),
    ('Sin restricciones especiales',     'Aplicar según programa sin condición adicional'),
]
condiciones_obj = {}
for nombre, desc in CONDICIONES:
    obj, c = Condicion.objects.get_or_create(nombre=nombre, defaults={'descripcion': desc})
    condiciones_obj[nombre] = obj
    print(f'  {"✓" if c else "·"} {nombre}')

print(f'\n Unidades:    {UnidadMedida.objects.count()}')
print(f' Plagas:      {Plaga.objects.count()}')
print(f' Objetivos:   {Objetivo.objects.count()}')
print(f' Condiciones: {Condicion.objects.count()}')
print('\nListo. Ahora ejecuta seed_plantillas2.py para recargar plantillas.')
