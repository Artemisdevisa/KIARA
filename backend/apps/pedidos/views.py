import logging
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Pedido
from .serializers import PedidoSerializer, CrearPedidoSerializer

logger = logging.getLogger(__name__)


class PedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'rol', None) == 'admin':
            return Pedido.objects.all().prefetch_related('items__cosecha')
        return Pedido.objects.filter(comprador=user).prefetch_related('items__cosecha')

    def get_serializer_class(self):
        if self.action in ('create', 'checkout'):
            return CrearPedidoSerializer
        return PedidoSerializer

    def create(self, request, *args, **kwargs):
        serializer = CrearPedidoSerializer(
            data=request.data, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        pedido = serializer.save()
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

    # ── POST /api/pedidos/checkout/ ─────────────────────────────
    # Crea el pedido Y la preferencia de MercadoPago en un solo paso.
    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        serializer = CrearPedidoSerializer(
            data=request.data, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        pedido = serializer.save()

        try:
            import mercadopago
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

            items = []
            for item in pedido.items.select_related('cosecha').all():
                items.append({
                    "title":      item.cosecha.nombre_producto,
                    "quantity":   1,
                    "unit_price": float(item.subtotal),
                    "currency_id": "PEN",
                })

            preference_data = {
                "items": items,
                "back_urls": {
                    "success": f"{settings.FRONTEND_URL}/pago-exitoso?pedido={pedido.id}",
                    "failure": f"{settings.FRONTEND_URL}/pago-fallido?pedido={pedido.id}",
                    "pending": f"{settings.FRONTEND_URL}/pago-pendiente?pedido={pedido.id}",
                },
                "auto_return":         "approved",
                "external_reference":  str(pedido.id),
                "notification_url":    f"{settings.BACKEND_URL}/api/pedidos/webhook/",
            }

            result = sdk.preference().create(preference_data)
            pref   = result.get("response", {})
            pref_id = pref.get("id", "")

            # Elegir URL: sandbox en dev, producción en prod
            if settings.MERCADOPAGO_SANDBOX:
                init_point = pref.get("sandbox_init_point") or pref.get("init_point", "")
            else:
                init_point = pref.get("init_point", "")

            pedido.mp_preference_id = pref_id
            pedido.save(update_fields=['mp_preference_id'])

            return Response({
                "pedido_id":    pedido.id,
                "preference_id": pref_id,
                "init_point":   init_point,
            }, status=status.HTTP_201_CREATED)

        except Exception as exc:
            logger.error("MercadoPago error: %s", exc)
            return Response({
                "pedido_id": pedido.id,
                "error": "No se pudo iniciar el pago con MercadoPago. "
                         "Verifica tu ACCESS_TOKEN en .env",
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # ── POST /api/pedidos/webhook/ ───────────────────────────────
    # Recibe notificaciones IPN de MercadoPago.
    @action(detail=False, methods=['post'], url_path='webhook',
            permission_classes=[AllowAny])
    def webhook(self, request):
        data    = request.data
        topic   = data.get('type') or request.query_params.get('topic', '')
        res_id  = data.get('data', {}).get('id') or request.query_params.get('id', '')

        if topic == 'payment' and res_id:
            try:
                import mercadopago
                sdk     = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
                payment = sdk.payment().get(res_id)
                info    = payment.get("response", {})
                status_mp   = info.get("status", "")
                pedido_id   = info.get("external_reference")
                payment_id  = str(info.get("id", ""))

                if pedido_id:
                    pedido = Pedido.objects.filter(id=pedido_id).first()
                    if pedido:
                        pedido.mp_payment_id = payment_id
                        if status_mp == "approved":
                            pedido.estado = "confirmado"
                        elif status_mp in ("rejected", "cancelled"):
                            pedido.estado = "cancelado"
                        pedido.save(update_fields=['estado', 'mp_payment_id'])
            except Exception as exc:
                logger.error("Webhook error: %s", exc)

        return Response({"ok": True})
