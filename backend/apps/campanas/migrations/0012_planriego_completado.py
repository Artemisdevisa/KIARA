from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0011_registroriego_completado'),
    ]

    operations = [
        migrations.AddField(
            model_name='planriego',
            name='completado',
            field=models.BooleanField(default=False),
        ),
    ]
