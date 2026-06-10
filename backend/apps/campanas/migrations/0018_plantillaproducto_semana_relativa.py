from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0017_laborcampana_planriego_es_sostenible'),
    ]

    operations = [
        migrations.AddField(
            model_name='plantillaproducto',
            name='semana_relativa',
            field=models.IntegerField(blank=True, null=True, verbose_name='Semana del ciclo'),
        ),
    ]
