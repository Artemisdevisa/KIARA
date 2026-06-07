from django.contrib import admin
from .models import Biohuerto


@admin.register(Biohuerto)
class BiohuertAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'productor', 'area', 'activo', 'created_at']
    list_filter = ['activo']
    search_fields = ['nombre', 'codigo', 'productor__username']
