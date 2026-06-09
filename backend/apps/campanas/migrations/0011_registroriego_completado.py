from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0010_campanaalerta'),
    ]

    operations = [
        migrations.AddField(
            model_name='registroriego',
            name='completado',
            field=models.BooleanField(default=False),
        ),
    ]
