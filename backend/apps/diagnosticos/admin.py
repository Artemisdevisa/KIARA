from django.contrib import admin
from .models import Diagnostico


@admin.register(Diagnostico)
class DiagnosticoAdmin(admin.ModelAdmin):
    list_display = ['diagnostico_probable', 'variedad', 'productor', 'parte_afectada', 'fecha']
    list_filter = ['parte_afectada']
