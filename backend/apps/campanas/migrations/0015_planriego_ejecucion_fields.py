from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0014_itemfito_ejecucion_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='planriego',
            name='operario',
            field=models.CharField(max_length=100, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='planriego',
            name='costo_agua_total',
            field=models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True),
        ),
    ]
