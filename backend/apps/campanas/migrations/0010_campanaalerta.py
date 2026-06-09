from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0009_itemfito_estado'),
    ]

    operations = [
        migrations.CreateModel(
            name='CampanaAlerta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[
                    ('riego', 'Riego'),
                    ('fertilizacion', 'Fertilización orgánica'),
                    ('control', 'Control preventivo'),
                    ('cosecha', 'Cosecha'),
                    ('seguridad', 'Intervalo de seguridad'),
                    ('labor', 'Labor programada'),
                    ('rotacion', 'Rotación de cultivos'),
                    ('otro', 'Otro'),
                ], max_length=20)),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('fecha_programada', models.DateField()),
                ('prioridad', models.CharField(choices=[
                    ('alta', 'Alta'), ('media', 'Media'), ('baja', 'Baja'),
                ], default='media', max_length=5)),
                ('completada', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('campana', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='alertas',
                    to='campanas.campana',
                )),
            ],
            options={
                'ordering': ['completada', 'fecha_programada', '-prioridad'],
            },
        ),
    ]
