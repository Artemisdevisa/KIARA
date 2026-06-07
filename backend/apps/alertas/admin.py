from django.contrib import admin
from .models import Alerta


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['cultivo', 'tipo', 'prioridad', 'fecha_programada', 'completada']
    list_filter = ['tipo', 'prioridad', 'completada']
