from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campanas', '0004_etapa_fenologica'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlantillaRiego',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('metodo', models.CharField(choices=[('goteo', 'Goteo'), ('aspersion', 'Aspersión'), ('gravedad', 'Gravedad'), ('manual', 'Manual')], default='goteo', max_length=15)),
                ('litros_por_m2', models.DecimalField(decimal_places=2, max_digits=8)),
                ('frecuencia_dias', models.IntegerField()),
                ('duracion_minutos', models.IntegerField(blank=True, null=True)),
                ('dosis_fertilizante', models.DecimalField(blank=True, decimal_places=3, max_digits=10, null=True)),
                ('etapa', models.CharField(blank=True, choices=[('preparacion', 'Preparación'), ('germinacion', 'Germinación'), ('crecimiento', 'Crecimiento'), ('establecido', 'Establecido'), ('poda', 'Poda'), ('brotacion', 'Brotación'), ('floracion', 'Floración'), ('cosecha', 'Cosecha')], default='', max_length=15)),
                ('semana_relativa', models.IntegerField(blank=True, null=True, verbose_name='Semana del ciclo')),
                ('fertilizante', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='plantilla_riegos', to='campanas.productoagricola')),
                ('variedad', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='plantilla_riegos', to='campanas.variedad')),
            ],
            options={
                'verbose_name': 'Plantilla de riego',
                'verbose_name_plural': 'Plantillas de riego',
                'ordering': ['etapa', 'semana_relativa', 'nombre'],
            },
        ),
    ]
