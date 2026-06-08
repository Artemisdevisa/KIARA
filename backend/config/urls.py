from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/biohuertos/', include('apps.biohuertos.urls')),
    path('api/cultivos/', include('apps.cultivos.urls')),
    path('api/monitoreo/', include('apps.monitoreo.urls')),
    path('api/alertas/', include('apps.alertas.urls')),
    path('api/diagnosticos/', include('apps.diagnosticos.urls')),
    path('api/cosechas/', include('apps.cosechas.urls')),
    path('api/trazabilidad/', include('apps.trazabilidad.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/pedidos/', include('apps.pedidos.urls')),
    path('api/campanas/', include('apps.campanas.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
