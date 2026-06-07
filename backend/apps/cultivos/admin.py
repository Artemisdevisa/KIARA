from django.contrib import admin
from .models import Cultivo


@admin.register(Cultivo)
class CultivoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'biohuerto', 'etapa', 'estado', 'fecha_siembra', 'fecha_estimada_cosecha']
    list_filter = ['etapa', 'estado']
    search_fields = ['nombre', 'biohuerto__nombre']
