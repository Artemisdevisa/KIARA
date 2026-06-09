from django.urls import path
from .views import (
    VariedadListCreate, VariedadDetail,
    ProductoListCreate, ProductoDetail,
    TipoLaborListCreate, TipoLaborDetail,
    UnidadMedidaListCreate, UnidadMedidaDetail,
    PlagaListCreate, PlagaDetail,
    ObjetivoListCreate, ObjetivoDetail,
    CondicionListCreate, CondicionDetail,
    CampanaListCreate, CampanaDetail,
    LaborListCreate, LaborDetail,
    FitosanitarioListCreate, FitosanitarioDetail,
    AplicacionListCreate, AplicacionDetail,
    PlanRiegoListCreate, PlanRiegoDetail,
    RegistroRiegoListCreate, RegistroRiegoDetail,
    PresupuestoListCreate, PresupuestoDetail,
    PracticaListCreate, PracticaDetail,
    PlantillaProductoListCreate, PlantillaProductoDetail,
    PlantillaLaborListCreate, PlantillaLaborDetail,
    PlantillaRiegoListCreate, PlantillaRiegoDetail,
)

urlpatterns = [
    # Catálogos base
    path('variedades/',                                       VariedadListCreate.as_view()),
    path('variedades/<int:pk>/',                              VariedadDetail.as_view()),
    path('variedades/<int:variedad_pk>/plantilla-productos/', PlantillaProductoListCreate.as_view()),
    path('plantilla-productos/<int:pk>/',                     PlantillaProductoDetail.as_view()),
    path('variedades/<int:variedad_pk>/plantilla-labores/',   PlantillaLaborListCreate.as_view()),
    path('plantilla-labores/<int:pk>/',                       PlantillaLaborDetail.as_view()),
    path('variedades/<int:variedad_pk>/plantilla-riego/',     PlantillaRiegoListCreate.as_view()),
    path('plantilla-riego/<int:pk>/',                         PlantillaRiegoDetail.as_view()),
    path('productos/',         ProductoListCreate.as_view()),
    path('productos/<int:pk>/', ProductoDetail.as_view()),
    path('tipos-labor/',       TipoLaborListCreate.as_view()),
    path('tipos-labor/<int:pk>/', TipoLaborDetail.as_view()),

    # Catálogos de apoyo
    path('unidades/',          UnidadMedidaListCreate.as_view()),
    path('unidades/<int:pk>/', UnidadMedidaDetail.as_view()),
    path('plagas/',            PlagaListCreate.as_view()),
    path('plagas/<int:pk>/',   PlagaDetail.as_view()),
    path('objetivos/',         ObjetivoListCreate.as_view()),
    path('objetivos/<int:pk>/', ObjetivoDetail.as_view()),
    path('condiciones/',       CondicionListCreate.as_view()),
    path('condiciones/<int:pk>/', CondicionDetail.as_view()),

    # Campañas
    path('',          CampanaListCreate.as_view()),
    path('<int:pk>/', CampanaDetail.as_view()),

    # Nested: labores
    path('<int:campana_pk>/labores/',        LaborListCreate.as_view()),
    path('labores/<int:pk>/',               LaborDetail.as_view()),

    # Nested: fitosanitario
    path('<int:campana_pk>/fitosanitario/',  FitosanitarioListCreate.as_view()),
    path('fitosanitario/<int:pk>/',         FitosanitarioDetail.as_view()),

    # Nested: aplicaciones
    path('<int:campana_pk>/aplicaciones/',   AplicacionListCreate.as_view()),
    path('aplicaciones/<int:pk>/',          AplicacionDetail.as_view()),

    # Nested: plan de riego
    path('<int:campana_pk>/plan-riego/',     PlanRiegoListCreate.as_view()),
    path('plan-riego/<int:pk>/',            PlanRiegoDetail.as_view()),

    # Nested: registros de riego
    path('<int:campana_pk>/registros-riego/', RegistroRiegoListCreate.as_view()),
    path('registros-riego/<int:pk>/',        RegistroRiegoDetail.as_view()),

    # Nested: presupuesto
    path('<int:campana_pk>/presupuesto/',    PresupuestoListCreate.as_view()),
    path('presupuesto/<int:pk>/',           PresupuestoDetail.as_view()),

    # Nested: prácticas sostenibles
    path('<int:campana_pk>/practicas/',      PracticaListCreate.as_view()),
    path('practicas/<int:pk>/',             PracticaDetail.as_view()),
]
