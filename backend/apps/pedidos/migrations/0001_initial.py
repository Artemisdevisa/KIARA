from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cosechas', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('estado', models.CharField(
                    choices=[
                        ('pendiente',  'Pendiente'),
                        ('confirmado', 'Confirmado'),
                        ('entregado',  'Entregado'),
                        ('cancelado',  'Cancelado'),
                    ],
                    default='pendiente', max_length=20, verbose_name='Estado',
                )),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Total (S/)')),
                ('notas', models.TextField(blank=True, verbose_name='Notas del comprador')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('comprador', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='pedidos',
                    to='users.user',
                    verbose_name='Comprador',
                )),
            ],
            options={'verbose_name': 'Pedido', 'verbose_name_plural': 'Pedidos', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ItemPedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Cantidad')),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Precio unitario (S/)')),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Subtotal (S/)')),
                ('cosecha', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='cosechas.cosecha',
                    verbose_name='Cosecha',
                )),
                ('pedido', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='items',
                    to='pedidos.pedido',
                )),
            ],
            options={'verbose_name': 'Item de pedido', 'verbose_name_plural': 'Items de pedido'},
        ),
    ]
