"""
Comando Django para poblar la base de datos con datos de demo.
Uso: python manage.py seed
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta, datetime


class Command(BaseCommand):
    help = 'Carga datos de ejemplo para la demo de BioHuerto USAT'

    def handle(self, *args, **kwargs):
        self.stdout.write('Cargando datos de demo...')

        from apps.users.models import User
        from apps.biohuertos.models import Biohuerto
        from apps.cultivos.models import Cultivo
        from apps.monitoreo.models import MonitoreoRegistro
        from apps.alertas.models import Alerta
        from apps.diagnosticos.models import Diagnostico
        from apps.cosechas.models import Cosecha
        from apps.trazabilidad.models import PracticaSostenible, Costo

        # Productor de demo
        user, created = User.objects.get_or_create(
            username='productor_demo',
            defaults={
                'email': 'demo@biohuerto.com',
                'first_name': 'María',
                'last_name': 'Flores',
                'telefono': '979123456',
                'rol': 'productor',
                'is_staff': False,
            }
        )
        if created:
            user.set_password('Demo1234')
            user.save()
            self.stdout.write(f'  Usuario creado: {user.username}')

        # Biohuerto
        bio, _ = Biohuerto.objects.get_or_create(
            nombre='Biohuerto USAT Norte',
            productor=user,
            defaults={
                'codigo': 'BH-001',
                'ubicacion': 'Urbanización Latina, calle Los Pinos 234, Chiclayo - Lambayeque',
                'area': 45.50,
                'descripcion': 'Biohuerto urbano comunitario de la USAT, enfocado en producción agroecológica de hortalizas y hierbas aromáticas para la familia y el barrio.',
            }
        )
        self.stdout.write(f'  Biohuerto: {bio.nombre}')

        hoy = date.today()

        # Cultivos
        c_lechuga, _ = Cultivo.objects.get_or_create(
            nombre='Lechuga hidropónica',
            biohuerto=bio,
            defaults={
                'fecha_siembra': hoy - timedelta(days=30),
                'etapa': 'crecimiento',
                'cantidad': 12,
                'unidad': 'm²',
                'fecha_estimada_cosecha': hoy + timedelta(days=15),
                'notas': 'Variedad Crespa verde. Buen desarrollo, sin plagas visibles.',
                'estado': 'activo',
            }
        )

        c_tomate, _ = Cultivo.objects.get_or_create(
            nombre='Tomate cherry',
            biohuerto=bio,
            defaults={
                'fecha_siembra': hoy - timedelta(days=90),
                'etapa': 'cosecha',
                'cantidad': 8,
                'unidad': 'm²',
                'fecha_estimada_cosecha': hoy - timedelta(days=5),
                'notas': 'Excelente rendimiento. Variedad Sweet 100.',
                'estado': 'cosechado',
            }
        )

        c_culantro, _ = Cultivo.objects.get_or_create(
            nombre='Culantro',
            biohuerto=bio,
            defaults={
                'fecha_siembra': hoy - timedelta(days=20),
                'etapa': 'crecimiento',
                'cantidad': 5,
                'unidad': 'm²',
                'fecha_estimada_cosecha': hoy + timedelta(days=10),
                'notas': 'Crecimiento uniforme. Riego diario.',
                'estado': 'activo',
            }
        )

        self.stdout.write('  Cultivos creados')

        # Registros de monitoreo
        for i in range(5):
            fecha_mon = hoy - timedelta(days=i)
            MonitoreoRegistro.objects.get_or_create(
                biohuerto=bio,
                fecha=fecha_mon,
                defaults={
                    'humedad': 65 - i,
                    'temperatura': 24 + i * 0.5,
                    'luminosidad': 'alta' if i % 2 == 0 else 'media',
                    'incidencias': 'Sin novedades.' if i > 0 else 'Se observaron 3 pulgones en lechuga. Se aplicó jabón potásico.',
                }
            )
        self.stdout.write('  Registros de monitoreo creados')

        # Alertas
        alertas_data = [
            {
                'cultivo': c_lechuga,
                'tipo': 'riego',
                'fecha_programada': timezone.now() + timedelta(hours=2),
                'descripcion': 'Riego por goteo - verificar presión del sistema',
                'prioridad': 'alta',
                'completada': False,
            },
            {
                'cultivo': c_lechuga,
                'tipo': 'cosecha',
                'fecha_programada': timezone.now() + timedelta(days=15),
                'descripcion': 'Fecha estimada de cosecha de lechuga crespa',
                'prioridad': 'media',
                'completada': False,
            },
            {
                'cultivo': c_culantro,
                'tipo': 'fertilizacion',
                'fecha_programada': timezone.now() - timedelta(days=1),
                'descripcion': 'Aplicación de biol al 20% - segunda dosis del mes',
                'prioridad': 'media',
                'completada': True,
            },
            {
                'cultivo': c_tomate,
                'tipo': 'rotacion',
                'fecha_programada': timezone.now() + timedelta(days=7),
                'descripcion': 'Planificar rotación - sembrar frijol en el área del tomate',
                'prioridad': 'baja',
                'completada': False,
            },
        ]
        for a_data in alertas_data:
            Alerta.objects.get_or_create(
                cultivo=a_data['cultivo'],
                tipo=a_data['tipo'],
                fecha_programada=a_data['fecha_programada'],
                defaults={k: v for k, v in a_data.items() if k not in ['cultivo', 'tipo', 'fecha_programada']}
            )
        self.stdout.write('  Alertas creadas')

        # Diagnóstico
        Diagnostico.objects.get_or_create(
            cultivo=c_lechuga,
            parte_afectada='hoja',
            defaults={
                'sintomas': ['presencia_insectos', 'hojas_enrolladas', 'manchas_amarillas'],
                'diagnostico_probable': 'Infestación de pulgones (áfidos)',
                'causa_probable': 'Colonias de insectos chupadores que se alimentan de la savia. Proliferan en condiciones de calor.',
                'recomendacion': 'Aplicar solución de jabón potásico (1 cucharada por litro de agua). Liberar mariquitas como control biológico.',
            }
        )
        self.stdout.write('  Diagnóstico creado')

        # Cosechas publicadas
        c1, _ = Cosecha.objects.get_or_create(
            nombre_producto='Tomate cherry orgánico',
            biohuerto=bio,
            defaults={
                'cultivo': c_tomate,
                'cantidad': 5,
                'unidad': 'kg',
                'precio': 8.00,
                'fecha_cosecha': hoy - timedelta(days=3),
                'contacto': 'WhatsApp: 979123456',
                'estado': 'disponible',
            }
        )

        c2, _ = Cosecha.objects.get_or_create(
            nombre_producto='Culantro fresco',
            biohuerto=bio,
            defaults={
                'cultivo': c_culantro,
                'cantidad': 20,
                'unidad': 'atados',
                'precio': 1.00,
                'fecha_cosecha': hoy + timedelta(days=10),
                'contacto': 'WhatsApp: 979123456',
                'estado': 'disponible',
            }
        )
        self.stdout.write('  Cosechas publicadas creadas')

        # Prácticas sostenibles
        practicas = [
            {'tipo': 'compost', 'fecha': hoy - timedelta(days=15), 'descripcion': 'Aplicación de compost maduro (5 kg por m²)'},
            {'tipo': 'biol', 'fecha': hoy - timedelta(days=7), 'descripcion': 'Aplicación foliar de biol al 20%'},
            {'tipo': 'sin_agroquimicos', 'fecha': hoy - timedelta(days=30), 'descripcion': 'Control de pulgones con jabón potásico'},
            {'tipo': 'riego_eficiente', 'fecha': hoy - timedelta(days=5), 'descripcion': 'Instalación de sistema de riego por goteo'},
        ]
        for p in practicas:
            PracticaSostenible.objects.get_or_create(
                cultivo=c_lechuga,
                tipo=p['tipo'],
                fecha=p['fecha'],
                defaults={'descripcion': p['descripcion']}
            )
        self.stdout.write('  Prácticas sostenibles creadas')

        # Costos de producción
        costos = [
            {'concepto': 'semillas', 'monto': 15.00, 'fecha': hoy - timedelta(days=32), 'descripcion': 'Semillas de lechuga crespa variedad selecta'},
            {'concepto': 'insumos', 'monto': 25.00, 'fecha': hoy - timedelta(days=28), 'descripcion': 'Compost y humus de lombriz'},
            {'concepto': 'agua', 'monto': 12.50, 'fecha': hoy - timedelta(days=15), 'descripcion': 'Consumo agua mes de campaña'},
            {'concepto': 'herramientas', 'monto': 35.00, 'fecha': hoy - timedelta(days=40), 'descripcion': 'Manguera de goteo y conectores'},
        ]
        for c in costos:
            Costo.objects.get_or_create(
                cultivo=c_lechuga,
                concepto=c['concepto'],
                fecha=c['fecha'],
                defaults={'monto': c['monto'], 'descripcion': c['descripcion']}
            )
        self.stdout.write('  Costos de producción creados')

        self.stdout.write(self.style.SUCCESS('\n[OK] Datos de demo cargados exitosamente.'))
        self.stdout.write(self.style.SUCCESS('  Usuario: productor_demo | Contrasena: Demo1234'))
