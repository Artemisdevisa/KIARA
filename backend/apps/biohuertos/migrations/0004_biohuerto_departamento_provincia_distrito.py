from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('biohuertos', '0003_biohuerto_latitud_longitud'),
    ]

    operations = [
        migrations.AddField(
            model_name='biohuerto',
            name='departamento',
            field=models.CharField(blank=True, max_length=100, verbose_name='Departamento'),
        ),
        migrations.AddField(
            model_name='biohuerto',
            name='provincia',
            field=models.CharField(blank=True, max_length=100, verbose_name='Provincia'),
        ),
        migrations.AddField(
            model_name='biohuerto',
            name='distrito',
            field=models.CharField(blank=True, max_length=100, verbose_name='Distrito'),
        ),
    ]
