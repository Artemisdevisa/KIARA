from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0015_planriego_ejecucion_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='campana',
            name='numero_ciclo',
            field=models.IntegerField(default=1, verbose_name='Número de ciclo'),
        ),
        migrations.AddField(
            model_name='campana',
            name='campana_anterior',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='campanas_siguientes',
                to='campanas.campana',
                verbose_name='Campaña anterior',
            ),
        ),
        migrations.AddField(
            model_name='plantillalabor',
            name='fase',
            field=models.CharField(
                choices=[
                    ('ambos', 'Ambos ciclos'),
                    ('establecimiento', 'Solo establecimiento (ciclo 1)'),
                    ('produccion', 'Solo producción (ciclo 2+)'),
                ],
                default='ambos', max_length=20, verbose_name='Aplica en',
            ),
        ),
        migrations.AddField(
            model_name='plantillaproducto',
            name='fase',
            field=models.CharField(
                choices=[
                    ('ambos', 'Ambos ciclos'),
                    ('establecimiento', 'Solo establecimiento (ciclo 1)'),
                    ('produccion', 'Solo producción (ciclo 2+)'),
                ],
                default='ambos', max_length=20, verbose_name='Aplica en',
            ),
        ),
        migrations.AddField(
            model_name='plantillariego',
            name='fase',
            field=models.CharField(
                choices=[
                    ('ambos', 'Ambos ciclos'),
                    ('establecimiento', 'Solo establecimiento (ciclo 1)'),
                    ('produccion', 'Solo producción (ciclo 2+)'),
                ],
                default='ambos', max_length=20, verbose_name='Aplica en',
            ),
        ),
    ]
