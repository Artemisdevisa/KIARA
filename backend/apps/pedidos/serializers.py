from rest_framework import serializers
from .models import Pedido, ItemPedido
from apps.cosechas.models import Cosecha


class ItemPedidoSerializer(serializers.ModelSerializer):
    cosecha_nombre = serializers.CharField(source='cosecha.nombre_producto', read_only=True)
    cosecha_unidad = serializers.CharField(source='cosecha.get_unidad_display', read_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'cosecha', 'cosecha_nombre', 'cosecha_unidad',
                  'cantidad', 'precio_unitario', 'subtotal']


class PedidoSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True, read_only=True)
    comprador_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = ['id', 'comprador', 'comprador_nombre', 'estado',
                  'total', 'notas', 'items', 'created_at', 'updated_at']
        read_only_fields = ['comprador', 'total', 'estado', 'created_at', 'updated_at']

    def get_comprador_nombre(self, obj):
        return obj.comprador.get_full_name() or obj.comprador.username


# ── Serializer para crear un pedido desde el carrito ──

class CrearItemSerializer(serializers.Serializer):
    cosecha_id = serializers.IntegerField()
    cantidad   = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)


class CrearPedidoSerializer(serializers.Serializer):
    items = CrearItemSerializer(many=True, min_length=1)
    notas = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, items):
        for item in items:
            try:
                cosecha = Cosecha.objects.get(id=item['cosecha_id'])
            except Cosecha.DoesNotExist:
                raise serializers.ValidationError(
                    f'La cosecha {item["cosecha_id"]} no existe.'
                )
            if cosecha.estado != 'disponible':
                raise serializers.ValidationError(
                    f'"{cosecha.nombre_producto}" ya no está disponible.'
                )
        return items

    def create(self, validated_data):
        comprador = self.context['request'].user
        items_data = validated_data['items']
        notas = validated_data.get('notas', '')

        total = 0
        items_to_create = []
        for item in items_data:
            cosecha = Cosecha.objects.get(id=item['cosecha_id'])
            precio = cosecha.precio
            subtotal = precio * item['cantidad']
            total += subtotal
            items_to_create.append(dict(
                cosecha=cosecha,
                cantidad=item['cantidad'],
                precio_unitario=precio,
                subtotal=subtotal,
            ))

        pedido = Pedido.objects.create(
            comprador=comprador,
            total=total,
            notas=notas,
        )
        for item in items_to_create:
            ItemPedido.objects.create(pedido=pedido, **item)

        return pedido
