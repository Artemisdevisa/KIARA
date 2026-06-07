from django.db import models


class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('pendiente',  'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('entregado',  'Entregado'),
        ('cancelado',  'Cancelado'),
    ]

    comprador = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='pedidos',
        verbose_name='Comprador',
    )
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default='pendiente',
        verbose_name='Estado',
    )
    total = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        verbose_name='Total (S/)',
    )
    notas = models.TextField(blank=True, verbose_name='Notas del comprador')
    mp_preference_id = models.CharField(max_length=200, blank=True, verbose_name='MercadoPago Preference ID')
    mp_payment_id    = models.CharField(max_length=200, blank=True, verbose_name='MercadoPago Payment ID')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-created_at']

    def __str__(self):
        return f'Pedido #{self.id} — {self.comprador.username} — {self.estado}'


class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido, on_delete=models.CASCADE,
        related_name='items',
    )
    cosecha = models.ForeignKey(
        'cosechas.Cosecha', on_delete=models.CASCADE,
        verbose_name='Cosecha',
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio unitario (S/)')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Subtotal (S/)')

    class Meta:
        verbose_name = 'Item de pedido'
        verbose_name_plural = 'Items de pedido'

    def __str__(self):
        return f'{self.cosecha.nombre_producto} x{self.cantidad}'
