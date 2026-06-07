from django.contrib import admin
from .models import Cosecha


@admin.register(Cosecha)
class CosechaAdmin(admin.ModelAdmin):
    list_display = ['nombre_producto', 'biohuerto', 'cantidad', 'unidad', 'precio', 'estado']
    list_filter = ['estado', 'unidad']
