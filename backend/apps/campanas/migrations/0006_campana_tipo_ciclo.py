from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0005_plantillariego'),
    ]

    operations = [
        migrations.AddField(
            model_name='campana',
            name='tipo_ciclo',
            field=models.CharField(
                blank=True,
                choices=[('', 'Heredar de variedad'), ('anual', 'Anual'), ('perenne', 'Perenne')],
                default='',
                max_length=10,
                verbose_name='Tipo de ciclo',
            ),
        ),
    ]
