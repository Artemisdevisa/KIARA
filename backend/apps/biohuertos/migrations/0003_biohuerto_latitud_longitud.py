from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('biohuertos', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='biohuerto',
            name='latitud',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True, verbose_name='Latitud'),
        ),
        migrations.AddField(
            model_name='biohuerto',
            name='longitud',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True, verbose_name='Longitud'),
        ),
    ]
