from django.contrib import admin
from .models import PracticaSostenible, Costo


@admin.register(PracticaSostenible)
class PracticaAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'cultivo', 'fecha']
    list_filter = ['tipo']


@admin.register(Costo)
class CostoAdmin(admin.ModelAdmin):
    list_display = ['concepto', 'cultivo', 'monto', 'fecha']
    list_filter = ['concepto']
