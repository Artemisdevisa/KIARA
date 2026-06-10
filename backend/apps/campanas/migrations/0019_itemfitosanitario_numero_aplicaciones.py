from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0018_plantillaproducto_semana_relativa'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemfitosanitario',
            name='numero_aplicaciones',
            field=models.IntegerField(blank=True, null=True, verbose_name='Número de aplicaciones'),
        ),
    ]
