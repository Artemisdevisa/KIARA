import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diagnosticos', '0003_diagnostico_campana'),
        ('campanas', '0009_itemfito_estado'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 1. Agregar productor (nullable temporalmente para migrar datos)
        migrations.AddField(
            model_name='diagnostico',
            name='productor',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='diagnosticos',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Productor',
            ),
        ),

        # 2. Poblar productor desde cultivo__biohuerto__productor
        migrations.RunSQL(
            sql="""
                UPDATE diagnosticos_diagnostico
                SET productor_id = (
                    SELECT b.productor_id
                    FROM cultivos_cultivo c
                    JOIN biohuertos_biohuerto b ON c.biohuerto_id = b.id
                    WHERE c.id = diagnosticos_diagnostico.cultivo_id
                )
                WHERE cultivo_id IS NOT NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        # 3. Agregar variedad (nullable)
        migrations.AddField(
            model_name='diagnostico',
            name='variedad',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='diagnosticos',
                to='campanas.variedad',
                verbose_name='Variedad',
            ),
        ),

        # 4. Hacer productor NOT NULL
        migrations.AlterField(
            model_name='diagnostico',
            name='productor',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='diagnosticos',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Productor',
            ),
        ),

        # 5. Eliminar cultivo
        migrations.RemoveField(
            model_name='diagnostico',
            name='cultivo',
        ),
    ]
