from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0013_campanaalerta_origen'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemfitosanitario',
            name='area_aplicada',
            field=models.DecimalField(decimal_places=2, max_digits=10, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='itemfitosanitario',
            name='operario',
            field=models.CharField(max_length=100, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='itemfitosanitario',
            name='es_sostenible',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='itemfitosanitario',
            name='observaciones',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
    ]
