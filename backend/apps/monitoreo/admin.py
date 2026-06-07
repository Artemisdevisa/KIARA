from django.contrib import admin
from .models import MonitoreoRegistro


@admin.register(MonitoreoRegistro)
class MonitoreoAdmin(admin.ModelAdmin):
    list_display = ['biohuerto', 'fecha', 'humedad', 'temperatura', 'luminosidad']
    list_filter = ['luminosidad']
