from django.db import migrations

CATEGORIAS = [
    {
        'nombre': 'Verduras', 'emoji': '🥬', 'slug': 'verduras', 'orden': 1,
        'tipos': [
            ('Lechugas',       'lechugas'),
            ('Espinacas',      'espinacas'),
            ('Acelgas',        'acelgas'),
            ('Brócoli',        'brocoli'),
            ('Zapallito',      'zapallito'),
            ('Pepino de campo','pepino-campo'),
        ],
    },
    {
        'nombre': 'Tomates', 'emoji': '🍅', 'slug': 'tomates', 'orden': 2,
        'tipos': [
            ('Cherry',         'cherry'),
            ('Romano',         'romano'),
            ('Redondo',        'redondo'),
            ('Verde',          'verde'),
        ],
    },
    {
        'nombre': 'Hierbas', 'emoji': '🌿', 'slug': 'hierbas', 'orden': 3,
        'tipos': [
            ('Culantro',       'culantro'),
            ('Albahaca',       'albahaca'),
            ('Menta',          'menta'),
            ('Perejil',        'perejil'),
            ('Orégano',        'oregano'),
            ('Romero',         'romero'),
        ],
    },
    {
        'nombre': 'Raíces', 'emoji': '🥕', 'slug': 'raices', 'orden': 4,
        'tipos': [
            ('Zanahoria',      'zanahoria'),
            ('Rábano',         'rabano'),
            ('Remolacha',      'remolacha'),
            ('Nabo',           'nabo'),
            ('Betarraga',      'betarraga'),
        ],
    },
    {
        'nombre': 'Granos', 'emoji': '🌽', 'slug': 'granos', 'orden': 5,
        'tipos': [
            ('Frijol canario', 'frijol-canario'),
            ('Maíz choclo',    'maiz-choclo'),
            ('Lentejas',       'lentejas'),
            ('Garbanzo',       'garbanzo'),
            ('Arveja',         'arveja'),
        ],
    },
    {
        'nombre': 'Frutas', 'emoji': '🍓', 'slug': 'frutas', 'orden': 6,
        'tipos': [
            ('Fresa',          'fresa'),
            ('Pepino dulce',   'pepino-dulce'),
            ('Tuna',           'tuna'),
            ('Maracuyá',       'maracuya'),
            ('Zapote',         'zapote'),
        ],
    },
    {
        'nombre': 'Plantas medicinales', 'emoji': '🌸', 'slug': 'medicinales', 'orden': 7,
        'tipos': [
            ('Sábila (Aloe)',  'sabila'),
            ('Manzanilla',     'manzanilla'),
            ('Muña',           'muna'),
            ('Toronjil',       'toronjil'),
        ],
    },
    {
        'nombre': 'Abonos y sustratos', 'emoji': '🪱', 'slug': 'abonos', 'orden': 8,
        'tipos': [
            ('Humus de lombriz','humus-lombriz'),
            ('Compost',        'compost'),
            ('Biol',           'biol'),
        ],
    },
]


def seed(apps, schema_editor):
    Cat  = apps.get_model('cosechas', 'CategoriaCosecha')
    Tipo = apps.get_model('cosechas', 'TipoCosecha')
    for datos in CATEGORIAS:
        tipos = datos.pop('tipos')
        cat, _ = Cat.objects.get_or_create(slug=datos['slug'], defaults=datos)
        for nombre, slug in tipos:
            Tipo.objects.get_or_create(categoria=cat, slug=slug, defaults={'nombre': nombre})
        datos['tipos'] = tipos


def rollback(apps, schema_editor):
    apps.get_model('cosechas', 'CategoriaCosecha').objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('cosechas', '0002_categoriacosecha_cosecha_categoria_tipocosecha'),
    ]

    operations = [
        migrations.RunPython(seed, rollback),
    ]
