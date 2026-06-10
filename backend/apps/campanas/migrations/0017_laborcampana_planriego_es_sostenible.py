from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0016_campana_numero_ciclo_anterior_plantilla_fase'),
    ]

    operations = [
        migrations.AddField(
            model_name='laborcampana',
            name='es_sostenible',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='planriego',
            name='es_sostenible',
            field=models.BooleanField(default=False),
        ),
    ]
