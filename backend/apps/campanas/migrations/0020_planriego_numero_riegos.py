from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0019_itemfitosanitario_numero_aplicaciones'),
    ]

    operations = [
        migrations.AddField(
            model_name='planriego',
            name='numero_riegos',
            field=models.IntegerField(blank=True, null=True, verbose_name='Número de riegos'),
        ),
    ]
