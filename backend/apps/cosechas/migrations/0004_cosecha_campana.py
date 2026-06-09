from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0012_planriego_completado'),
        ('cosechas', '0003_seed_categorias'),
    ]

    operations = [
        migrations.AddField(
            model_name='cosecha',
            name='campana',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='cosechas',
                to='campanas.campana',
                verbose_name='Campaña',
            ),
        ),
    ]
