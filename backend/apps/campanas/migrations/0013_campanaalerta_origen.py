from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0012_planriego_completado'),
    ]

    operations = [
        migrations.AddField(
            model_name='campanaalerta',
            name='origen',
            field=models.CharField(
                max_length=15,
                default='manual',
                choices=[('manual', 'Manual'), ('monitoreo', 'Monitoreo'), ('sistema', 'Sistema')],
                verbose_name='Origen',
            ),
        ),
    ]
