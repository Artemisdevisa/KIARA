"""
Comando para insertar datos de demostración para la hackathon.
Uso: python manage.py seed_demo [--user <username>]

- Idempotente: se puede correr varias veces sin duplicar datos.
- No toca datos existentes, solo agrega usando get_or_create.
"""
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Inserta datos de demostración para la hackathon KIARA'

    def add_arguments(self, parser):
        parser.add_argument('--user', type=str, default=None,
                            help='Username del productor (default: primer superusuario)')

    def handle(self, *args, **options):
        from apps.biohuertos.models import Biohuerto
        from apps.campanas.models import (
            Variedad, ProductoAgricola, TipoLabor,
            Campana, LaborCampana, ItemFitosanitario,
            PlanRiego, PresupuestoItem, PracticaSostenible,
            CampanaAlerta, UnidadMedida,
        )
        from apps.monitoreo.models import MonitoreoRegistro
        from apps.cosechas.models import Cosecha, CategoriaCosecha
        from apps.diagnosticos.models import Diagnostico

        # ── Usuario ────────────────────────────────────────────────
        username = options['user']
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                self.stderr.write(f'Usuario "{username}" no encontrado.')
                return
        else:
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                self.stderr.write('No hay superusuarios. Crea uno primero.')
                return

        self.stdout.write(f'Seeding demo para usuario: {user.username}')
        hoy = date.today()

        # ── Biohuerto ─────────────────────────────────────────────
        biohuerto, created = Biohuerto.objects.get_or_create(
            productor=user,
            nombre='Biohuerto KIARA Demo',
            defaults=dict(
                ubicacion='Av. Salaverry 1020, Chiclayo, Lambayeque',
                area=500,
                descripcion='Biohuerto de demostración para la hackathon. Producción orgánica certificada.',
                departamento='Lambayeque',
                provincia='Chiclayo',
                distrito='Chiclayo',
                latitud=-6.771977,
                longitud=-79.840883,
                activo=True,
            )
        )
        self._log('Biohuerto', created, biohuerto.nombre)

        # ── Unidad de medida ──────────────────────────────────────
        unidad_ml_l, _ = UnidadMedida.objects.get_or_create(
            codigo='mL/L',
            defaults=dict(nombre='Mililitros por litro', tipo='vol_vol')
        )
        unidad_g_l, _ = UnidadMedida.objects.get_or_create(
            codigo='g/L',
            defaults=dict(nombre='Gramos por litro', tipo='masa_vol')
        )

        # ── Variedades ────────────────────────────────────────────
        var_tomate, _ = Variedad.objects.get_or_create(
            cultivo='Tomate', nombre='Sweet 100 (Cherry)',
            defaults=dict(tipo_ciclo='anual', dias_ciclo=90,
                          descripcion='Tomate cherry de alto rendimiento, ideal para huertos orgánicos.')
        )
        var_cebolla, _ = Variedad.objects.get_or_create(
            cultivo='Cebolla', nombre='Roja Arequipeña',
            defaults=dict(tipo_ciclo='anual', dias_ciclo=120,
                          descripcion='Cebolla roja de sabor intenso, adaptada a la costa norte del Perú.')
        )
        var_lechuga, _ = Variedad.objects.get_or_create(
            cultivo='Lechuga', nombre='Batavia Verde',
            defaults=dict(tipo_ciclo='anual', dias_ciclo=60,
                          descripcion='Lechuga de hoja crespa, ciclo corto, ideal para producción continua.')
        )

        # ── Productos agrícolas ───────────────────────────────────
        prod_bv, _ = ProductoAgricola.objects.get_or_create(
            nombre='Beauveria bassiana',
            defaults=dict(tipo='biologico', unidad='g', precio_unitario=18.50,
                          descripcion='Hongo entomopatógeno para control biológico de insectos plagas.')
        )
        prod_algas, _ = ProductoAgricola.objects.get_or_create(
            nombre='Extracto de algas Ascophyllum',
            defaults=dict(tipo='bioestimulante', unidad='L', precio_unitario=35.00,
                          descripcion='Bioestimulante que mejora resistencia al estrés y calidad del fruto.')
        )
        prod_tricho, _ = ProductoAgricola.objects.get_or_create(
            nombre='Trichoderma harzianum',
            defaults=dict(tipo='biologico', unidad='kg', precio_unitario=22.00,
                          descripcion='Hongo antagonista para prevención de enfermedades del suelo.')
        )
        prod_compost, _ = ProductoAgricola.objects.get_or_create(
            nombre='Compost orgánico certificado',
            defaults=dict(tipo='enmienda', unidad='kg', precio_unitario=2.50,
                          descripcion='Enmienda orgánica para mejora de estructura del suelo.')
        )

        # ── Tipos de labor ────────────────────────────────────────
        labor_prep, _ = TipoLabor.objects.get_or_create(
            nombre='Preparación y mullido de suelo',
            defaults=dict(tipo='otro', unidad_default='jornal', costo_unitario_default=40)
        )
        labor_siembra, _ = TipoLabor.objects.get_or_create(
            nombre='Siembra directa o trasplante',
            defaults=dict(tipo='otro', unidad_default='jornal', costo_unitario_default=80)
        )
        labor_riego, _ = TipoLabor.objects.get_or_create(
            nombre='Riego manual con manguera',
            defaults=dict(tipo='riego', unidad_default='hora', costo_unitario_default=5)
        )
        labor_deshierbe, _ = TipoLabor.objects.get_or_create(
            nombre='Deshierbe y limpieza de camas',
            defaults=dict(tipo='otro', unidad_default='jornal', costo_unitario_default=35)
        )
        labor_cosecha_l, _ = TipoLabor.objects.get_or_create(
            nombre='Cosecha y clasificación',
            defaults=dict(tipo='cosecha', unidad_default='jornal', costo_unitario_default=45)
        )

        # ══════════════════════════════════════════════════════════
        # CAMPAÑA 1: ACTIVA — Tomate Cherry
        # ══════════════════════════════════════════════════════════
        campana_tomate, created = Campana.objects.get_or_create(
            biohuerto=biohuerto,
            variedad=var_tomate,
            anio=2026,
            defaults=dict(
                fecha_inicio=hoy - timedelta(days=30),
                fecha_fin=hoy + timedelta(days=60),
                area=200,
                estado='activa',
                objetivo_cosecha=180,
                unidad_cosecha='kg',
                precio_venta_estimado=4.50,
                notas='Campaña de tomate cherry orgánico. Producción bajo sistema de tutoraje vertical.',
            )
        )
        self._log('Campaña Tomate (activa)', created, campana_tomate.codigo)

        if created:
            # Labores
            LaborCampana.objects.create(
                campana=campana_tomate, tipo_labor=labor_prep,
                fecha_programada=hoy - timedelta(days=30),
                cantidad_programada=2, costo_unitario=40,
                estado='ejecutada', etapa='preparacion',
                fecha_ejecutada=hoy - timedelta(days=30),
                cantidad_ejecutada=2,
            )
            LaborCampana.objects.create(
                campana=campana_tomate, tipo_labor=labor_siembra,
                fecha_programada=hoy - timedelta(days=25),
                cantidad_programada=3, costo_unitario=80,
                estado='ejecutada', etapa='preparacion',
                fecha_ejecutada=hoy - timedelta(days=25),
                cantidad_ejecutada=3,
            )
            LaborCampana.objects.create(
                campana=campana_tomate, tipo_labor=labor_deshierbe,
                fecha_programada=hoy - timedelta(days=10),
                cantidad_programada=2, costo_unitario=35,
                estado='ejecutada', etapa='crecimiento',
                fecha_ejecutada=hoy - timedelta(days=10),
                cantidad_ejecutada=2,
            )
            LaborCampana.objects.create(
                campana=campana_tomate, tipo_labor=labor_riego,
                fecha_programada=hoy + timedelta(days=2),
                cantidad_programada=1, costo_unitario=5,
                estado='programada', etapa='floracion',
            )
            LaborCampana.objects.create(
                campana=campana_tomate, tipo_labor=labor_cosecha_l,
                fecha_programada=hoy + timedelta(days=55),
                cantidad_programada=4, costo_unitario=45,
                estado='programada', etapa='cosecha',
            )

            # Fitosanitario
            ItemFitosanitario.objects.create(
                campana=campana_tomate, producto=prod_bv,
                dosis=3, unidad=unidad_g_l,
                frecuencia_dias=15, etapa='crecimiento',
                estado='aplicado', fecha_inicio=hoy - timedelta(days=20),
                dias_antes_cosecha=3,
            )
            ItemFitosanitario.objects.create(
                campana=campana_tomate, producto=prod_algas,
                dosis=3, unidad=unidad_ml_l,
                frecuencia_dias=21, etapa='floracion',
                estado='programado', fecha_inicio=hoy + timedelta(days=5),
            )

            # Plan de riego
            PlanRiego.objects.create(
                campana=campana_tomate,
                nombre='Fertiriego bio vegetativo',
                metodo='goteo', litros_por_m2=7.5,
                frecuencia_dias=2, duracion_minutos=30,
                fertilizante=prod_algas, dosis_fertilizante=3,
                fecha_inicio=hoy - timedelta(days=25),
                activo=True,
            )
            PlanRiego.objects.create(
                campana=campana_tomate,
                nombre='Riego establecimiento microaspersión',
                metodo='aspersion', litros_por_m2=2,
                frecuencia_dias=2, duracion_minutos=25,
                fertilizante=prod_tricho, dosis_fertilizante=5,
                fecha_inicio=hoy - timedelta(days=25),
                activo=True,
            )

            # Presupuesto
            PresupuestoItem.objects.create(
                campana=campana_tomate, categoria='insumo',
                descripcion='Beauveria bassiana (control biológico)',
                cantidad=5, unidad='kg',
                precio_unitario=18.50, monto_ejecutado=37.00,
            )
            PresupuestoItem.objects.create(
                campana=campana_tomate, categoria='insumo',
                descripcion='Extracto de algas Ascophyllum',
                cantidad=3, unidad='L',
                precio_unitario=35.00, monto_ejecutado=35.00,
            )
            PresupuestoItem.objects.create(
                campana=campana_tomate, categoria='mano_obra',
                descripcion='Jornales preparación y siembra',
                cantidad=5, unidad='jornal',
                precio_unitario=40.00, monto_ejecutado=200.00,
            )
            PresupuestoItem.objects.create(
                campana=campana_tomate, categoria='agua',
                descripcion='Agua para riego por goteo',
                cantidad=1, unidad='mes',
                precio_unitario=30.00, monto_ejecutado=15.00,
            )

            # Prácticas sostenibles (para semáforo verde)
            PracticaSostenible.objects.create(
                campana=campana_tomate, tipo='control_biologico',
                descripcion='Aplicación de Beauveria bassiana para control de mosca blanca. Sin agroquímicos sintéticos.',
                fecha=hoy - timedelta(days=20),
            )
            PracticaSostenible.objects.create(
                campana=campana_tomate, tipo='compost',
                descripcion='Incorporación de 200 kg de compost orgánico certificado antes del trasplante.',
                fecha=hoy - timedelta(days=28),
            )
            PracticaSostenible.objects.create(
                campana=campana_tomate, tipo='riego_eficiente',
                descripcion='Sistema de riego por goteo instalado. Reducción del 40% en consumo de agua vs. riego por gravedad.',
                fecha=hoy - timedelta(days=25),
            )

            # Alertas pre-generadas
            CampanaAlerta.objects.create(
                campana=campana_tomate, tipo='riego', origen='sistema',
                titulo='Riego: Fertiriego bio vegetativo',
                descripcion='Método Goteo con Extracto de algas Ascophyllum. 7.5 L/m². Frecuencia: cada 2 días.',
                fecha_programada=hoy + timedelta(days=1),
                prioridad='media',
            )
            CampanaAlerta.objects.create(
                campana=campana_tomate, tipo='control', origen='sistema',
                titulo='Aplicación: Extracto de algas Ascophyllum',
                descripcion='Etapa: Floración. Aplicar cada 21 días.',
                fecha_programada=hoy + timedelta(days=5),
                prioridad='media',
            )
            CampanaAlerta.objects.create(
                campana=campana_tomate, tipo='cosecha', origen='sistema',
                titulo='Cosecha programada',
                descripcion=f'La campaña finaliza el {(hoy + timedelta(days=60)).strftime("%d/%m/%Y")}. Preparar herramientas y empaques.',
                fecha_programada=hoy + timedelta(days=60),
                prioridad='baja',
            )
            CampanaAlerta.objects.create(
                campana=campana_tomate, tipo='control', origen='monitoreo',
                titulo='Temperatura alta (36.5°C) — riesgo para el cultivo',
                descripcion='Se registró 36.5°C en el biohuerto. Rango óptimo para Lambayeque: 18–32°C. Considera sombrear o ventilar.',
                fecha_programada=hoy - timedelta(days=3),
                prioridad='alta',
                completada=False,
            )

        # ══════════════════════════════════════════════════════════
        # CAMPAÑA 2: CERRADA — Cebolla Roja Arequipeña (con cosecha)
        # ══════════════════════════════════════════════════════════
        campana_cebolla, created = Campana.objects.get_or_create(
            biohuerto=biohuerto,
            variedad=var_cebolla,
            anio=2025,
            defaults=dict(
                fecha_inicio=hoy - timedelta(days=150),
                fecha_fin=hoy - timedelta(days=15),
                area=300,
                estado='cerrada',
                objetivo_cosecha=250,
                unidad_cosecha='kg',
                precio_venta_estimado=2.80,
                notas='Campaña cerrada exitosamente. Rendimiento superior al esperado.',
            )
        )
        self._log('Campaña Cebolla (cerrada)', created, campana_cebolla.codigo)

        if created:
            LaborCampana.objects.create(
                campana=campana_cebolla, tipo_labor=labor_prep,
                fecha_programada=hoy - timedelta(days=150),
                cantidad_programada=3, costo_unitario=40,
                estado='ejecutada', etapa='preparacion',
                fecha_ejecutada=hoy - timedelta(days=150), cantidad_ejecutada=3,
            )
            LaborCampana.objects.create(
                campana=campana_cebolla, tipo_labor=labor_cosecha_l,
                fecha_programada=hoy - timedelta(days=15),
                cantidad_programada=5, costo_unitario=45,
                estado='ejecutada', etapa='cosecha',
                fecha_ejecutada=hoy - timedelta(days=15), cantidad_ejecutada=5,
            )
            PracticaSostenible.objects.create(
                campana=campana_cebolla, tipo='sin_agroquimicos',
                descripcion='Campaña 100% sin agroquímicos sintéticos. Control de trips con Beauveria bassiana.',
                fecha=hoy - timedelta(days=60),
            )

        # ── Cosecha publicada en marketplace ─────────────────────
        cat_hortalizas, _ = CategoriaCosecha.objects.get_or_create(
            slug='hortalizas',
            defaults=dict(nombre='Hortalizas', emoji='🥬', orden=1)
        )
        cosecha, created = Cosecha.objects.get_or_create(
            biohuerto=biohuerto,
            campana=campana_cebolla,
            defaults=dict(
                nombre_producto='Cebolla Roja Arequipeña Orgánica',
                categoria=cat_hortalizas,
                cantidad=180,
                unidad='kg',
                precio=2.80,
                fecha_cosecha=hoy - timedelta(days=15),
                contacto='WhatsApp: 979-123-456',
                estado='disponible',
            )
        )
        self._log('Cosecha publicada', created, cosecha.nombre_producto)

        # ══════════════════════════════════════════════════════════
        # CAMPAÑA 3: PLANIFICADA — Lechuga Batavia
        # ══════════════════════════════════════════════════════════
        campana_lechuga, created = Campana.objects.get_or_create(
            biohuerto=biohuerto,
            variedad=var_lechuga,
            anio=2026,
            defaults=dict(
                fecha_inicio=hoy + timedelta(days=7),
                fecha_fin=hoy + timedelta(days=67),
                area=100,
                estado='planificada',
                objetivo_cosecha=80,
                unidad_cosecha='kg',
                precio_venta_estimado=3.50,
                notas='Próxima campaña. Rotación con tomate para recuperación del suelo.',
            )
        )
        self._log('Campaña Lechuga (planificada)', created, campana_lechuga.codigo)

        # ── Monitoreo ─────────────────────────────────────────────
        registros_monitoreo = [
            # Normales
            (hoy - timedelta(days=14), 25.5, 68, 'alta', ''),
            (hoy - timedelta(days=12), 26.0, 72, 'alta', ''),
            (hoy - timedelta(days=10), 27.5, 65, 'media', ''),
            (hoy - timedelta(days=8),  24.0, 70, 'alta', ''),
            (hoy - timedelta(days=6),  28.0, 60, 'media', ''),
            # Fuera de rango (generan alertas)
            (hoy - timedelta(days=3),  36.5, 45, 'alta', 'Día muy caluroso. Se aplicó sombreo temporal en las camas de tomate.'),
            (hoy - timedelta(days=1),  22.0, 88, 'baja', 'Día nublado con llovizna. Humedad elevada, se mejoró ventilación.'),
            # Hoy
            (hoy,                      24.5, 67, 'alta', 'Condiciones óptimas. Todo normal.'),
        ]
        for fecha_m, temp, hum, lum, inc in registros_monitoreo:
            MonitoreoRegistro.objects.get_or_create(
                biohuerto=biohuerto, fecha=fecha_m,
                defaults=dict(temperatura=temp, humedad=hum, luminosidad=lum, incidencias=inc)
            )
        self.stdout.write(f'  → Monitoreo: {len(registros_monitoreo)} registros')

        # ── Diagnósticos ──────────────────────────────────────────
        diag1, created = Diagnostico.objects.get_or_create(
            productor=user,
            variedad=var_tomate,
            campana=campana_tomate,
            parte_afectada='Hojas',
            defaults=dict(
                sintomas=['Manchas amarillas', 'Bordes secos', 'Hojas enrolladas'],
                diagnostico_probable='Deficiencia de magnesio con posible inicio de Alternaria',
                causa_probable='Suelo con baja disponibilidad de magnesio. Las altas temperaturas recientes favorecen el desarrollo fúngico.',
                recomendacion='Aplicar sulfato de magnesio foliar (2 g/L). Aumentar frecuencia de riego. Aplicar Trichoderma harzianum al suelo (5 g/L) para fortalecer raíces.',
                severidad='moderado',
                acciones_preventivas=['Monitoreo semanal de hojas', 'Análisis de suelo', 'Mejorar ventilación entre plantas'],
                metodo='formulario',
            )
        )
        self._log('Diagnóstico tomate', created, diag1.diagnostico_probable[:50])

        diag2, created = Diagnostico.objects.get_or_create(
            productor=user,
            variedad=var_cebolla,
            campana=campana_cebolla,
            parte_afectada='Bulbo',
            defaults=dict(
                sintomas=['Pudrición en la base', 'Olor desagradable', 'Raíces oscuras'],
                diagnostico_probable='Fusarium oxysporum (Fusariosis de la cebolla)',
                causa_probable='Hongo del suelo favorecido por exceso de humedad y temperaturas elevadas. Suelo compactado con mal drenaje.',
                recomendacion='Retirar plantas afectadas y quemar fuera del campo. Aplicar Trichoderma harzianum (5 g/L). Mejorar drenaje del suelo. Rotar cultivos la próxima temporada.',
                severidad='grave',
                acciones_preventivas=['Rotación con gramíneas', 'Desinfección del suelo con cal agrícola', 'Evitar exceso de riego'],
                metodo='formulario',
            )
        )
        self._log('Diagnóstico cebolla', created, diag2.diagnostico_probable[:50])

        self.stdout.write(self.style.SUCCESS('\n✓ Datos de demo insertados correctamente.'))
        self.stdout.write('  Campaña activa:     ' + campana_tomate.codigo)
        self.stdout.write('  Campaña cerrada:    ' + campana_cebolla.codigo)
        self.stdout.write('  Campaña planific.:  ' + campana_lechuga.codigo)
        self.stdout.write('  Cosecha publicada:  ' + cosecha.nombre_producto)
        self.stdout.write('  Biohuerto:          ' + biohuerto.nombre)

    def _log(self, label, created, name):
        if created:
            self.stdout.write(f'  + {label}: {name}')
        else:
            self.stdout.write(f'  ~ {label} ya existe: {name}')
