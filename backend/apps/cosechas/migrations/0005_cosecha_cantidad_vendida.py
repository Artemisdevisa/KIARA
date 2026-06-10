from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cosechas', '0004_cosecha_campana'),
    ]

    operations = [
        migrations.AddField(
            model_name='cosecha',
            name='cantidad_vendida',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Cantidad vendida'),
        ),
    ]
