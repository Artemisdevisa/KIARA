from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='mp_preference_id',
            field=models.CharField(blank=True, max_length=200, verbose_name='MercadoPago Preference ID'),
        ),
        migrations.AddField(
            model_name='pedido',
            name='mp_payment_id',
            field=models.CharField(blank=True, max_length=200, verbose_name='MercadoPago Payment ID'),
        ),
    ]
