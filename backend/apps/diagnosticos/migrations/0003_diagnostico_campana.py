import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0009_itemfito_estado'),
        ('diagnosticos', '0002_diagnostico_ia_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='diagnostico',
            name='campana',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='diagnosticos',
                to='campanas.campana',
                verbose_name='Campaña',
            ),
        ),
    ]
