from django.contrib import admin
from .models import Variedad, ProductoAgricola, TipoLabor, Campana, LaborCampana, ItemFitosanitario, RegistroAplicacion, PlanRiego, RegistroRiego, PresupuestoItem, PracticaSostenible

admin.site.register(Variedad)
admin.site.register(ProductoAgricola)
admin.site.register(TipoLabor)
admin.site.register(Campana)
admin.site.register(LaborCampana)
admin.site.register(ItemFitosanitario)
admin.site.register(RegistroAplicacion)
admin.site.register(PlanRiego)
admin.site.register(RegistroRiego)
admin.site.register(PresupuestoItem)
admin.site.register(PracticaSostenible)
