"""
Backfill: asigna etapa a LaborCampana e ItemFitosanitario existentes
buscando la coincidencia en PlantillaLabor / PlantillaProducto de la misma variedad.
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.campanas.models import LaborCampana, ItemFitosanitario, PlantillaLabor, PlantillaProducto

# ── Labores ──────────────────────────────────────────────────────
updated_l = 0
for labor in LaborCampana.objects.filter(etapa='').select_related('campana__variedad', 'tipo_labor'):
    variedad = labor.campana.variedad
    pl = PlantillaLabor.objects.filter(variedad=variedad, tipo_labor=labor.tipo_labor).exclude(etapa='').first()
    if pl:
        labor.etapa = pl.etapa
        labor.save(update_fields=['etapa'])
        updated_l += 1

# ── Fitosanitario ─────────────────────────────────────────────────
updated_f = 0
for item in ItemFitosanitario.objects.filter(etapa='').select_related('campana__variedad', 'producto'):
    variedad = item.campana.variedad
    pp = PlantillaProducto.objects.filter(variedad=variedad, producto=item.producto).exclude(etapa='').first()
    if pp:
        item.etapa = pp.etapa
        item.save(update_fields=['etapa'])
        updated_f += 1

print(f'Labores actualizadas:  {updated_l}')
print(f'Fitosanitario actualizados: {updated_f}')
