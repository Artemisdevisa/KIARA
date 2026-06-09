from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diagnosticos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='diagnostico',
            name='severidad',
            field=models.CharField(
                max_length=20,
                choices=[('leve', 'Leve'), ('moderado', 'Moderado'), ('grave', 'Grave')],
                default='moderado',
                blank=True,
                verbose_name='Severidad',
            ),
        ),
        migrations.AddField(
            model_name='diagnostico',
            name='acciones_preventivas',
            field=models.JSONField(default=list, blank=True, verbose_name='Acciones preventivas'),
        ),
        migrations.AddField(
            model_name='diagnostico',
            name='metodo',
            field=models.CharField(
                max_length=20,
                choices=[('formulario', 'Formulario guiado'), ('imagen', 'Análisis por imagen')],
                default='formulario',
                verbose_name='Método de diagnóstico',
            ),
        ),
        migrations.AddField(
            model_name='diagnostico',
            name='imagen',
            field=models.ImageField(
                upload_to='diagnosticos/',
                null=True,
                blank=True,
                verbose_name='Imagen del cultivo',
            ),
        ),
        migrations.AlterField(
            model_name='diagnostico',
            name='sintomas',
            field=models.JSONField(default=list, blank=True, verbose_name='Síntomas seleccionados'),
        ),
    ]
