"""
Comando Django para poblar la base de datos con datos realistas.
Uso: python manage.py seed
Limpia toda la data existente y recarga desde cero.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Limpia y recarga la BD con datos realistas de biohuertos (Lambayeque, Peru)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Limpiando base de datos...')
        self._limpiar()
        self.stdout.write('Cargando datos...')
        with transaction.atomic():
            self._catalogos()
            self._usuarios_y_biohuertos()
        self.stdout.write(self.style.SUCCESS('\n[OK] Base de datos poblada exitosamente.'))
        self.stdout.write(self.style.SUCCESS('  admin     / Admin1234'))
        self.stdout.write(self.style.SUCCESS('  maria_f   / Demo1234'))
        self.stdout.write(self.style.SUCCESS('  carlos_r  / Demo1234'))

    # ------------------------------------------------------------------
    def _limpiar(self):
        from apps.campanas.models import (
            PracticaSostenible, PresupuestoItem, RegistroRiego, PlanRiego,
            RegistroAplicacion, ItemFitosanitario, LaborCampana, Campana,
            PlantillaRiego, PlantillaLabor, PlantillaProducto,
            Condicion, Objetivo, Plaga, UnidadMedida,
            TipoLabor, ProductoAgricola, Variedad,
        )
        from apps.trazabilidad.models import PracticaSostenible as PS2, Costo
        from apps.cosechas.models import Cosecha, TipoCosecha, CategoriaCosecha
        from apps.pedidos.models import ItemPedido, Pedido
        from apps.diagnosticos.models import Diagnostico
        from apps.alertas.models import Alerta
        from apps.monitoreo.models import MonitoreoRegistro
        from apps.cultivos.models import Cultivo
        from apps.biohuertos.models import Biohuerto, BiohuertMiembro, DocumentoBiohuerto
        from apps.users.models import User

        PracticaSostenible.objects.all().delete()
        PresupuestoItem.objects.all().delete()
        RegistroRiego.objects.all().delete()
        PlanRiego.objects.all().delete()
        RegistroAplicacion.objects.all().delete()
        ItemFitosanitario.objects.all().delete()
        LaborCampana.objects.all().delete()
        Campana.objects.all().delete()
        PlantillaRiego.objects.all().delete()
        PlantillaLabor.objects.all().delete()
        PlantillaProducto.objects.all().delete()
        Condicion.objects.all().delete()
        Objetivo.objects.all().delete()
        Plaga.objects.all().delete()
        UnidadMedida.objects.all().delete()
        TipoLabor.objects.all().delete()
        ProductoAgricola.objects.all().delete()
        Variedad.objects.all().delete()
        PS2.objects.all().delete()
        Costo.objects.all().delete()
        ItemPedido.objects.all().delete()
        Pedido.objects.all().delete()
        Diagnostico.objects.all().delete()
        Alerta.objects.all().delete()
        MonitoreoRegistro.objects.all().delete()
        Cosecha.objects.all().delete()
        TipoCosecha.objects.filter().delete()
        CategoriaCosecha.objects.all().delete()
        BiohuertMiembro.objects.all().delete()
        DocumentoBiohuerto.objects.all().delete()
        Cultivo.objects.all().delete()
        Biohuerto.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write('  Tablas limpiadas')

    # ------------------------------------------------------------------
    def _catalogos(self):
        self._variedades()
        self._productos()
        self._labores()
        self._unidades()
        self._plagas()
        self._objetivos()
        self._condiciones()
        self._categorias_cosecha()

    # ------------------------------------------------------------------
    def _variedades(self):
        from apps.campanas.models import Variedad
        data = [
            # (cultivo, nombre, subtipo, ciclo, dias, descripcion)
            ('Tomate',    'Rio Grande',         '',         'anual',   90,  'Variedad de tomate industrial, fruto ovalado firme, alta productividad. Ideal para produccion organica en costa norte.'),
            ('Tomate',    'Sweet 100',          'Cherry',   'anual',   80,  'Tomate cherry de alta dulzura. Racimos de 20-30 frutos. Muy demandado en mercados locales y bioferias.'),
            ('Lechuga',   'Crespa Verde',       '',         'anual',   45,  'Lechuga de hoja suelta, sabor suave. Ciclo corto ideal para produccion continua en biohuertos urbanos.'),
            ('Lechuga',   'Romana',             '',         'anual',   55,  'Lechuga de cabeza alargada, hojas crocantes. Buena tolerancia al calor de la costa lambayecana.'),
            ('Pimiento',  'California Wonder',  '',         'anual',   75,  'Pimiento morrón verde/rojo. Frutos grandes y carnosos, alta demanda en restaurantes de Chiclayo.'),
            ('Pepino',    'Marketer',           '',         'anual',   60,  'Pepino liso de piel fina, sabor fresco. Excelente rendimiento en climas calidos con riego eficiente.'),
            ('Cebolla',   'Roja Arequipena',    '',         'anual',  120,  'Cebolla de color rojo intenso, bulbo grande. Referente en mercados del norte del pais, alta rentabilidad.'),
            ('Culantro',  'Criollo',            '',         'anual',   30,  'Hierba aromatica de ciclo ultracorto. Produccion continua con resiembra cada 3 semanas. Alta rotacion.'),
            ('Albahaca',  'Genovesa',           '',         'anual',   45,  'Albahaca clasica de hoja grande y aroma intenso. Muy solicitada para gastronomia local y exportacion.'),
            ('Maracuya',  'Amarilla',           '',         'perenne', 365, 'Maracuya amarilla de alta acidez y aroma. Ciclo perenne de 3-4 anos, excelente para jugos y mercado regional.'),
        ]
        objs = [
            Variedad(cultivo=c, nombre=n, subtipo=s, tipo_ciclo=ci, dias_ciclo=d, descripcion=desc)
            for c, n, s, ci, d, desc in data
        ]
        Variedad.objects.bulk_create(objs)
        self.stdout.write('  Variedades creadas (10)')

    # ------------------------------------------------------------------
    def _productos(self):
        from apps.campanas.models import ProductoAgricola
        data = [
            # (nombre, tipo, unidad, precio, descripcion)
            ('Compost orgánico maduro',       'enmienda',       'kg',  1.50, 'Compost de residuos vegetales y estiercol curado 3 meses. Mejora estructura del suelo.'),
            ('Humus de lombriz',              'enmienda',       'kg',  2.00, 'Vermicompost de alta calidad. Rico en microorganismos beneficos y nutrientes disponibles.'),
            ('Biol fermentado',               'bioestimulante', 'L',   5.00, 'Bioestimulante liquido de origen animal/vegetal. Aplicacion foliar al 20%. Estimula crecimiento.'),
            ('Jabón potásico',                'fitosanitario',  'L',  18.00, 'Insecticida de contacto organico. Eficaz contra pulgones, mosca blanca y araña roja.'),
            ('Trichoderma harzianum',         'biologico',      'kg', 25.00, 'Hongo benefico para control de patogenos del suelo. Previene damping-off y pudricion radicular.'),
            ('Beauveria bassiana',            'biologico',      'kg', 30.00, 'Hongo entomopatogeno para control de insectos plagas. Eficaz contra mosca blanca y trips.'),
            ('Sulfato de cobre pentahidrato', 'fitosanitario',  'kg', 12.00, 'Fungicida de accion preventiva y curativa. Control de mildiu, tizón y enfermedades fungicas.'),
            ('Nitrato de calcio',             'fertilizante',   'kg',  8.00, 'Fuente de calcio y nitrogeno de rapida asimilacion. Fortalece paredes celulares y previene BER.'),
            ('Sulfato de magnesio',           'fertilizante',   'kg',  6.00, 'Fuente de magnesio y azufre. Corrige clorosis intervenal y mejora calidad de frutos.'),
            ('Extracto de algas (Ascophyllum)', 'bioestimulante', 'L', 35.00, 'Bioestimulante de algas marinas. Mejora cuajado de frutos, tolerancia a estres hidrico.'),
        ]
        objs = [
            ProductoAgricola(nombre=n, tipo=t, unidad=u, precio_unitario=p, descripcion=d)
            for n, t, u, p, d in data
        ]
        ProductoAgricola.objects.bulk_create(objs)
        self.stdout.write('  Productos agricolas creados (10)')

    # ------------------------------------------------------------------
    def _labores(self):
        from apps.campanas.models import TipoLabor
        data = [
            # (nombre, tipo, unidad_default, costo)
            ('Preparacion y mullido de suelo',    'otro',       'jornal', 40.00),
            ('Siembra directa o trasplante',      'formacion',  'jornal', 40.00),
            ('Riego manual con manguera',          'riego',      'hora',   5.00),
            ('Fertilizacion foliar',               'aplicacion', 'hora',   8.00),
            ('Control fitosanitario foliar',       'aplicacion', 'hora',   8.00),
            ('Deshierbo y limpieza de camas',      'otro',       'jornal', 35.00),
            ('Poda de formacion y tutoraje',       'formacion',  'hora',   8.00),
            ('Poda de mantenimiento',              'poda',       'hora',   8.00),
            ('Cosecha y clasificacion',            'cosecha',    'jornal', 45.00),
            ('Instalacion sistema riego goteo',    'otro',       'hora',  12.00),
        ]
        for nombre, tipo, unidad, costo in data:
            TipoLabor.objects.create(nombre=nombre, tipo=tipo, unidad_default=unidad, costo_unitario_default=costo)
        self.stdout.write('  Tipos de labor creados (10)')

    # ------------------------------------------------------------------
    def _unidades(self):
        from apps.campanas.models import UnidadMedida
        data = [
            ('cc/L',   'Centímetros cúbicos por litro de agua',  'vol_vol'),
            ('mL/L',   'Mililitros por litro de agua',           'vol_vol'),
            ('L/ha',   'Litros por hectárea',                    'vol_area'),
            ('L/m²',   'Litros por metro cuadrado',              'vol_area'),
            ('g/L',    'Gramos por litro de agua',               'masa_vol'),
            ('g/m²',   'Gramos por metro cuadrado',              'masa_area'),
            ('kg/ha',  'Kilogramos por hectárea',                'masa_area'),
            ('kg/m²',  'Kilogramos por metro cuadrado',          'masa_area'),
        ]
        objs = [UnidadMedida(codigo=c, nombre=n, tipo=t) for c, n, t in data]
        UnidadMedida.objects.bulk_create(objs)
        self.stdout.write('  Unidades de medida creadas (8)')

    # ------------------------------------------------------------------
    def _plagas(self):
        from apps.campanas.models import Plaga
        data = [
            ('Pulgón verde',           'Myzus persicae',            'insecto',  'Insecto chupador colonias en brotes tiernos. Transmite virus.'),
            ('Mosca blanca',           'Bemisia tabaci',            'insecto',  'Insecto chupador que debilita plantas y transmite geminivirus.'),
            ('Araña roja',             'Tetranychus urticae',       'acaro',    'Acaro que succiona contenido celular. Produce bronceado y defoliacion.'),
            ('Tizón tardío',           'Phytophthora infestans',    'hongo',    'Oomiceto devastador en solanaceas. Requiere humedad elevada.'),
            ('Mildiu velloso',         'Peronospora spp.',          'hongo',    'Hongo que ataca el enves de hojas con pelusa grisacea.'),
            ('Trips',                  'Frankliniella occidentalis', 'insecto',  'Insecto minusculo que raspa epidermis y transmite TSWV.'),
            ('Minador de hoja',        'Liriomyza sativae',         'insecto',  'Larva que crea galeras serpenteantes en el mesofifo foliar.'),
            ('Nematodo del nudo',      'Meloidogyne incognita',     'nematodo', 'Nematodo que forma agallas en raices, reduce absorcion de nutrientes.'),
        ]
        objs = [Plaga(nombre=n, nombre_cientifico=nc, tipo=t, descripcion=d) for n, nc, t, d in data]
        Plaga.objects.bulk_create(objs)
        self.stdout.write('  Plagas creadas (8)')

    # ------------------------------------------------------------------
    def _objetivos(self):
        from apps.campanas.models import Objetivo, Plaga
        p = {pl.nombre: pl for pl in Plaga.objects.all()}
        data = [
            ('Control de pulgon verde',        'control',       'Pulgón verde'),
            ('Control de mosca blanca',         'control',       'Mosca blanca'),
            ('Control de araña roja',           'control',       'Araña roja'),
            ('Control de tizon tardio',         'control',       'Tizón tardío'),
            ('Control de mildiu',               'control',       'Mildiu velloso'),
            ('Control de trips',                'control',       'Trips'),
            ('Prevencion de hongos del suelo',  'prevencion',    None),
            ('Fertilizacion foliar calcio',     'fertilizacion', None),
            ('Bioestimulacion radicular',       'estimulacion',  None),
        ]
        objs = [Objetivo(nombre=n, tipo=t, plaga=p.get(pl)) for n, t, pl in data]
        Objetivo.objects.bulk_create(objs)
        self.stdout.write('  Objetivos creados (9)')

    # ------------------------------------------------------------------
    def _condiciones(self):
        from apps.campanas.models import Condicion
        data = [
            ('Aplicar antes de las 8 am',           'Evitar horas de mayor temperatura para reducir evaporacion y fitotoxicidad.'),
            ('Aplicar en ausencia de viento',        'Viento mayor a 15 km/h dispersa el producto y reduce eficacia.'),
            ('No aplicar con lluvia proxima',        'La lluvia lava el producto antes de actuar. Esperar 24 horas.'),
            ('Aplicar cada 15 dias preventivo',      'Frecuencia preventiva para mantener poblaciones de plagas bajo umbral.'),
            ('Aplicar al inicio de floracion',       'Momento critico para cuajado de frutos y control de trips en flores.'),
            ('Mojar bien el enves de las hojas',     'Pulgones, araña roja y mosca blanca se ubican principalmente en el enves.'),
        ]
        objs = [Condicion(nombre=n, descripcion=d) for n, d in data]
        Condicion.objects.bulk_create(objs)
        self.stdout.write('  Condiciones creadas (6)')

    # ------------------------------------------------------------------
    def _categorias_cosecha(self):
        from apps.cosechas.models import CategoriaCosecha, TipoCosecha
        cats = [
            ('Hortalizas',   'hortalizas',   1),
            ('Frutas',       'frutas',        2),
            ('Hierbas',      'hierbas',       3),
        ]
        for nombre, slug, orden in cats:
            cat = CategoriaCosecha.objects.create(nombre=nombre, slug=slug, orden=orden)
            if nombre == 'Hortalizas':
                for t, s in [('Tomate', 'tomate'), ('Lechuga', 'lechuga'), ('Pimiento', 'pimiento'),
                             ('Pepino', 'pepino'), ('Cebolla', 'cebolla')]:
                    TipoCosecha.objects.create(categoria=cat, nombre=t, slug=s)
            elif nombre == 'Frutas':
                for t, s in [('Maracuyá', 'maracuya')]:
                    TipoCosecha.objects.create(categoria=cat, nombre=t, slug=s)
            elif nombre == 'Hierbas':
                for t, s in [('Culantro', 'culantro'), ('Albahaca', 'albahaca')]:
                    TipoCosecha.objects.create(categoria=cat, nombre=t, slug=s)
        self.stdout.write('  Categorias de cosecha creadas')

    # ------------------------------------------------------------------
    def _usuarios_y_biohuertos(self):
        from apps.users.models import User
        from apps.biohuertos.models import Biohuerto

        # Admin
        admin = User.objects.create_superuser(
            username='admin', email='admin@biohuerto.usat.pe',
            password='Admin1234', first_name='Admin', last_name='USAT',
        )
        admin.rol = 'admin'
        admin.save()

        # Productora 1 — Maria Flores
        maria = User.objects.create_user(
            username='maria_f', email='maria.flores@biohuerto.pe',
            password='Demo1234', first_name='Maria', last_name='Flores Llontop',
            telefono='979123456', rol='productor',
        )

        # Productor 2 — Carlos Ruiz
        carlos = User.objects.create_user(
            username='carlos_r', email='carlos.ruiz@biohuerto.pe',
            password='Demo1234', first_name='Carlos', last_name='Ruiz Chavez',
            telefono='968987654', rol='productor',
        )

        self.stdout.write('  Usuarios creados (3)')

        # Biohuerto 1 — Maria
        bio1 = Biohuerto.objects.create(
            productor=maria,
            nombre='Biohuerto San Isidro',
            codigo='BH-001',
            ubicacion='Urb. San Isidro, calle Los Alamos 145, Chiclayo',
            area=80.00,
            descripcion='Biohuerto familiar agroecologico con produccion de hortalizas y hierbas para venta local.',
            departamento='Lambayeque', provincia='Chiclayo', distrito='Chiclayo',
            latitud=-6.771900, longitud=-79.840900,
        )

        # Biohuerto 2 — Carlos
        bio2 = Biohuerto.objects.create(
            productor=carlos,
            nombre='Biohuerto La Viña',
            codigo='BH-002',
            ubicacion='Sector La Viña, carretera Pimentel km 3.5, Chiclayo',
            area=150.00,
            descripcion='Biohuerto semi-comercial con variedades de tomate, pimiento y maracuya. Enfoque en mercados y restaurantes.',
            departamento='Lambayeque', provincia='Chiclayo', distrito='Pimentel',
            latitud=-6.836200, longitud=-79.931400,
        )

        self.stdout.write('  Biohuertos creados (2)')
        self._cultivos_y_campanas(bio1, bio2)

    # ------------------------------------------------------------------
    def _cultivos_y_campanas(self, bio1, bio2):
        from apps.campanas.models import Variedad
        hoy = date.today()

        vars_q = {f'{v.cultivo}|{v.nombre}': v for v in Variedad.objects.all()}

        def v(cultivo, nombre):
            return vars_q[f'{cultivo}|{nombre}']

        # --- Bio1: lechuga, culantro, albahaca, pimiento ---
        self._crear_campana(bio1, v('Lechuga',  'Crespa Verde'),   hoy - timedelta(days=25), 12.0,
                            objetivo_kg=36.0, precio_kg=4.50, estado='activa')
        self._crear_campana(bio1, v('Culantro', 'Criollo'),        hoy - timedelta(days=10),  5.0,
                            objetivo_kg=10.0, precio_kg=3.00, estado='activa')
        self._crear_campana(bio1, v('Albahaca', 'Genovesa'),       hoy - timedelta(days=20),  4.0,
                            objetivo_kg=8.0,  precio_kg=6.00, estado='activa')
        self._crear_campana(bio1, v('Pimiento', 'California Wonder'), hoy - timedelta(days=50), 15.0,
                            objetivo_kg=60.0, precio_kg=5.00, estado='activa')
        self._crear_campana(bio1, v('Lechuga',  'Romana'),         hoy - timedelta(days=90),  8.0,
                            objetivo_kg=20.0, precio_kg=4.00, estado='cerrada')

        # --- Bio2: tomate, pepino, cebolla, maracuya ---
        self._crear_campana(bio2, v('Tomate',   'Rio Grande'),     hoy - timedelta(days=60), 30.0,
                            objetivo_kg=120.0, precio_kg=3.50, estado='activa')
        self._crear_campana(bio2, v('Tomate',   'Sweet 100'),      hoy - timedelta(days=45), 10.0,
                            objetivo_kg=50.0,  precio_kg=7.00, estado='activa')
        self._crear_campana(bio2, v('Pepino',   'Marketer'),       hoy - timedelta(days=30), 20.0,
                            objetivo_kg=80.0,  precio_kg=2.50, estado='activa')
        self._crear_campana(bio2, v('Cebolla',  'Roja Arequipena'), hoy - timedelta(days=80), 25.0,
                            objetivo_kg=100.0, precio_kg=2.00, estado='activa')
        self._crear_campana(bio2, v('Maracuya', 'Amarilla'),       hoy - timedelta(days=180), 40.0,
                            objetivo_kg=200.0, precio_kg=4.00, estado='activa')

        self.stdout.write('  Campanas creadas (10)')
        self._cosechas_publicadas(bio1, bio2)
        self._monitoreo(bio1, bio2)

    # ------------------------------------------------------------------
    def _crear_campana(self, bio, variedad, fecha_inicio, area, objetivo_kg, precio_kg, estado):
        from apps.campanas.models import (
            Campana, LaborCampana, ItemFitosanitario, PlanRiego, RegistroRiego,
            PresupuestoItem, PracticaSostenible,
            TipoLabor, ProductoAgricola, Plaga, Objetivo, Condicion, UnidadMedida,
        )
        hoy = date.today()
        anio = fecha_inicio.year

        camp = Campana.objects.create(
            biohuerto=bio,
            variedad=variedad,
            codigo=f'CAMP-{bio.codigo}-{variedad.cultivo[:3].upper()}-{anio}',
            anio=anio,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_inicio + timedelta(days=variedad.dias_ciclo) if variedad.dias_ciclo else None,
            area=area,
            unidad_area='m²',
            estado=estado,
            objetivo_cosecha=objetivo_kg,
            unidad_cosecha='kg',
            precio_venta_estimado=precio_kg,
            notas=f'Campaña {variedad} en {bio.nombre}. Manejo 100% organico.',
        )

        # -- Tipos de labor y productos (referencias)
        labores_q  = {l.nombre: l for l in TipoLabor.objects.all()}
        prods_q    = {p.nombre: p for p in ProductoAgricola.objects.all()}
        plagas_q   = {p.nombre: p for p in Plaga.objects.all()}
        objetivos_q = {o.nombre: o for o in Objetivo.objects.all()}
        conds_q    = {c.nombre: c for c in Condicion.objects.all()}
        unids_q    = {u.codigo: u for u in UnidadMedida.objects.all()}

        def lab(nombre):
            return labores_q.get(nombre)
        def prod(nombre):
            return prods_q.get(nombre)

        # -- Labores por etapa ----------------------------------------
        semana = timedelta(weeks=1)
        labores = [
            # (tipo_labor, etapa, fecha_prog, cant, costo_unit, estado, operario)
            (lab('Preparacion y mullido de suelo'), 'preparacion',
             fecha_inicio - timedelta(days=7), 1, 40.00, 'ejecutada', 'Juan Perez'),
            (lab('Siembra directa o trasplante'), 'germinacion',
             fecha_inicio, 1, 40.00, 'ejecutada', 'Juan Perez'),
            (lab('Deshierbo y limpieza de camas'), 'crecimiento',
             fecha_inicio + semana * 2, 1, 35.00,
             'ejecutada' if estado in ('activa', 'cerrada') else 'programada', 'Maria Quispe'),
            (lab('Fertilizacion foliar'), 'crecimiento',
             fecha_inicio + semana * 2, 2, 8.00,
             'ejecutada' if estado in ('activa', 'cerrada') else 'programada', 'Maria Quispe'),
            (lab('Control fitosanitario foliar'), 'floracion',
             fecha_inicio + semana * 4, 2, 8.00,
             'programada', 'Juan Perez'),
            (lab('Cosecha y clasificacion'), 'cosecha',
             fecha_inicio + timedelta(days=variedad.dias_ciclo - 5) if variedad.dias_ciclo else hoy + timedelta(days=10),
             2, 45.00, 'cerrada' if estado == 'cerrada' else 'programada', 'Juan Perez'),
        ]
        if variedad.tipo_ciclo == 'perenne':
            labores.append(
                (lab('Poda de mantenimiento'), 'poda',
                 fecha_inicio + semana * 8, 1, 8.00, 'ejecutada', 'Carlos Ramos')
            )

        for tl, etapa, fp, cant, costo, est, op in labores:
            if tl is None:
                continue
            fe = fp if est == 'ejecutada' else None
            ce = cant if est == 'ejecutada' else None
            LaborCampana.objects.create(
                campana=camp, tipo_labor=tl, etapa=etapa,
                fecha_programada=fp, fecha_ejecutada=fe,
                cantidad_programada=cant, cantidad_ejecutada=ce,
                costo_unitario=costo, estado=est, operario=op,
            )

        # -- Plan fitosanitario ----------------------------------------
        jabon  = prod('Jabón potásico')
        biol   = prod('Biol fermentado')
        tricho = prod('Trichoderma harzianum')
        beauv  = prod('Beauveria bassiana')
        cobre  = prod('Sulfato de cobre pentahidrato')

        cc_L  = unids_q.get('cc/L')
        g_L   = unids_q.get('g/L')
        cond1 = conds_q.get('Aplicar antes de las 8 am')
        cond2 = conds_q.get('Mojar bien el enves de las hojas')
        cond3 = conds_q.get('Aplicar cada 15 dias preventivo')

        fito_data = [
            # (producto, objetivo_nombre, plaga_nombre, dosis, unidad, dias_cos, cond, freq, etapa)
            (jabon,  'Control de pulgon verde',  'Pulgón verde',  5.0,  cc_L, 3,  cond2, 15, 'crecimiento'),
            (jabon,  'Control de mosca blanca',  'Mosca blanca',  5.0,  cc_L, 3,  cond2, 15, 'floracion'),
            (beauv,  'Control de mosca blanca',  'Mosca blanca',  2.0,  g_L,  5,  cond1, 15, 'floracion'),
            (biol,   'Bioestimulacion radicular', None,           2.0,  cc_L, 0,  cond3, 14, 'crecimiento'),
            (tricho, 'Prevencion de hongos del suelo', None,      2.0,  g_L,  0,  cond3, 30, 'preparacion'),
        ]
        if variedad.cultivo in ('Tomate', 'Pimiento', 'Pepino'):
            fito_data.append(
                (cobre, 'Control de tizon tardio', 'Tizón tardío', 3.0, g_L, 7, cond3, 21, 'floracion')
            )

        for prd, obj_n, pl_n, dosis, unid, dias_cos, cond, freq, etapa in fito_data:
            if prd is None:
                continue
            obj = objetivos_q.get(obj_n)
            plg = plagas_q.get(pl_n) if pl_n else None
            ItemFitosanitario.objects.create(
                campana=camp, producto=prd, objetivo=obj, plaga=plg,
                dosis=dosis, unidad=unid, dias_antes_cosecha=dias_cos,
                condicion=cond, frecuencia_dias=freq,
                fecha_inicio=fecha_inicio + timedelta(days=14),
                etapa=etapa, estado='programado',
            )

        # -- Plan de riego ---------------------------------------------
        nitrato = prod('Nitrato de calcio')
        metodo  = 'goteo' if variedad.cultivo not in ('Culantro', 'Albahaca') else 'manual'
        litros  = 2.50 if variedad.cultivo in ('Tomate', 'Pimiento', 'Pepino') else 1.50
        freq_r  = 2 if variedad.cultivo in ('Culantro', 'Albahaca') else 3

        plan = PlanRiego.objects.create(
            campana=camp,
            nombre=f'Riego {variedad.cultivo} — {metodo.capitalize()}',
            metodo=metodo,
            litros_por_m2=litros,
            frecuencia_dias=freq_r,
            duracion_minutos=30 if metodo == 'goteo' else 20,
            fertilizante=nitrato,
            dosis_fertilizante=2.0,
            fecha_inicio=fecha_inicio,
            fecha_fin=camp.fecha_fin,
            activo=True,
        )

        # Registros de riego (ultimas 4 aplicaciones)
        costo_agua_m2 = round(litros * 1.20 / 1000 * area, 2)
        for i in range(4, 0, -1):
            fecha_r = hoy - timedelta(days=i * freq_r)
            if fecha_r >= fecha_inicio:
                RegistroRiego.objects.create(
                    campana=camp, plan=plan,
                    fecha=fecha_r,
                    litros_aplicados=round(litros * area, 2),
                    area_regada=area,
                    costo_agua=round(litros * area * 0.0012, 2),
                    fertilizante=nitrato,
                    dosis_fertilizante=2.0,
                    operario='Juan Perez',
                    observaciones='Riego y fertiriego segun plan.',
                )

        # -- Presupuesto -----------------------------------------------
        ingreso_estimado = float(objetivo_kg) * float(precio_kg)
        presupuesto = [
            # (categoria, descripcion, cantidad, unidad, precio_unit, ejecutado)
            ('insumo',    'Compost organico maduro',     round(area * 0.5, 1), 'kg',     1.50, round(area * 0.5 * 1.50, 2)),
            ('insumo',    'Humus de lombriz',            round(area * 0.3, 1), 'kg',     2.00, round(area * 0.3 * 2.00, 2)),
            ('insumo',    'Biol fermentado',             round(area * 0.1, 1), 'L',      5.00, round(area * 0.1 * 5.00, 2)),
            ('insumo',    'Jabon potasico',              round(area * 0.05, 2),'L',     18.00, round(area * 0.05 * 18, 2)),
            ('agua',      'Agua de riego por goteo',     round(litros * area * 20, 1), 'L', 0.0012, round(litros * area * 20 * 0.0012, 2)),
            ('mano_obra', 'Preparacion y deshierbo',     2,                    'jornal', 40.00, 80.00),
            ('mano_obra', 'Siembra / trasplante',        1,                    'jornal', 40.00, 40.00),
            ('mano_obra', 'Cosecha y clasificacion',     2,                    'jornal', 45.00, 0.00),
        ]
        for cat, desc, cant, uni, pu, ejec in presupuesto:
            PresupuestoItem.objects.create(
                campana=camp, categoria=cat, descripcion=desc,
                cantidad=cant, unidad=uni, precio_unitario=pu,
                monto_ejecutado=ejec,
            )

        # -- Practicas sostenibles -------------------------------------
        PracticaSostenible.objects.create(
            campana=camp, tipo='compost',
            descripcion=f'Incorporacion de {round(area * 0.5)} kg compost maduro al voleo antes del trasplante.',
            fecha=fecha_inicio - timedelta(days=5),
            cantidad=round(area * 0.5, 1), unidad='kg',
        )
        PracticaSostenible.objects.create(
            campana=camp, tipo='sin_agroquimicos',
            descripcion='Manejo fitosanitario exclusivamente con productos organicos y biologicos.',
            fecha=fecha_inicio,
        )
        PracticaSostenible.objects.create(
            campana=camp, tipo='riego_eficiente',
            descripcion=f'Sistema de riego por {metodo} con fertirriego de nitrato de calcio.',
            fecha=fecha_inicio,
        )

    # ------------------------------------------------------------------
    def _cosechas_publicadas(self, bio1, bio2):
        from apps.cosechas.models import Cosecha, CategoriaCosecha
        from apps.campanas.models import Variedad
        hoy = date.today()

        hort = CategoriaCosecha.objects.get(slug='hortalizas')
        herb = CategoriaCosecha.objects.get(slug='hierbas')
        frut = CategoriaCosecha.objects.get(slug='frutas')

        cosechas = [
            # (biohuerto, cat, nombre, cant, unidad, precio, dias, contacto)
            (bio1, hort, 'Lechuga crespa organica',   30, 'unidades', 1.50, -2, '979-123-456'),
            (bio1, herb, 'Culantro fresco criollo',   50, 'atados',   0.80, -1, '979-123-456'),
            (bio1, herb, 'Albahaca genovesa fresca',  20, 'atados',   1.00, -3, '979-123-456'),
            (bio1, hort, 'Pimiento morrón verde',     15, 'kg',       5.00, -5, '979-123-456'),
            (bio2, hort, 'Tomate Rio Grande organico',40, 'kg',       3.50, -4, '968-987-654'),
            (bio2, hort, 'Tomate cherry Sweet 100',   10, 'kg',       7.00, -2, '968-987-654'),
            (bio2, hort, 'Pepino fresco Marketer',    25, 'kg',       2.50, -3, '968-987-654'),
            (bio2, frut, 'Maracuyá amarilla',         20, 'kg',       4.00, -1, '968-987-654'),
        ]
        for bio, cat, nombre, cant, uni, precio, dias, contacto in cosechas:
            Cosecha.objects.create(
                biohuerto=bio, categoria=cat, nombre_producto=nombre,
                cantidad=cant, unidad=uni, precio=precio,
                fecha_cosecha=hoy + timedelta(days=dias),
                contacto=f'WhatsApp: {contacto}',
                estado='disponible',
            )
        self.stdout.write('  Cosechas publicadas creadas (8)')

    # ------------------------------------------------------------------
    def _monitoreo(self, bio1, bio2):
        from apps.monitoreo.models import MonitoreoRegistro
        from apps.alertas.models import Alerta
        from apps.cultivos.models import Cultivo
        hoy = date.today()

        registros = [
            # bio1
            (bio1, 0,  68, 24.5, 'alta',  'Sin novedades. Crecimiento uniforme en lechuga y pimiento.'),
            (bio1, 1,  70, 24.0, 'alta',  'Se observan pulgones en brotes de albahaca. Se aplico jabon potasico.'),
            (bio1, 2,  65, 25.0, 'media', 'Humedad optima. Deshierbo en camas de culantro.'),
            (bio1, 3,  72, 23.5, 'alta',  'Riego preventivo. Sin plagas visibles.'),
            (bio1, 4,  66, 24.8, 'alta',  'Aplicacion de biol foliar al 20%. Buena respuesta.'),
            # bio2
            (bio2, 0,  60, 26.0, 'alta',  'Tomate Rio Grande en floracion. Cuajado excelente.'),
            (bio2, 1,  63, 25.5, 'media', 'Mosca blanca en pepino. Se aplico Beauveria bassiana.'),
            (bio2, 2,  58, 27.0, 'alta',  'Maracuya con buen desarrollo vegetativo. Riego por goteo.'),
            (bio2, 3,  61, 26.5, 'alta',  'Tomate cherry en cosecha. Produccion continua.'),
            (bio2, 4,  64, 25.0, 'media', 'Aplicacion de sulfato de cobre preventivo en tomate.'),
        ]
        for bio, dias, hum, temp, lum, inc in registros:
            MonitoreoRegistro.objects.create(
                biohuerto=bio, fecha=hoy - timedelta(days=dias),
                humedad=hum, temperatura=temp, luminosidad=lum, incidencias=inc,
            )

        # Alertas sobre cultivos de bio1 (buscamos los cultivos de las campanas)
        from apps.campanas.models import Campana
        camps_bio1 = list(Campana.objects.filter(biohuerto=bio1).order_by('fecha_inicio'))
        if camps_bio1:
            from apps.cultivos.models import Cultivo
            # Crear cultivos vinculados a los biohuertos para las alertas
            c_lech, _ = Cultivo.objects.get_or_create(
                nombre='Lechuga Crespa Verde',
                biohuerto=bio1,
                defaults={
                    'tipo_ciclo': 'anual', 'etapa': 'crecimiento',
                    'cantidad': 12, 'unidad': 'm²',
                    'fecha_siembra': hoy - timedelta(days=25),
                    'fecha_estimada_cosecha': hoy + timedelta(days=20),
                    'estado': 'activo',
                }
            )
            c_tom, _ = Cultivo.objects.get_or_create(
                nombre='Tomate Rio Grande',
                biohuerto=bio2,
                defaults={
                    'tipo_ciclo': 'anual', 'etapa': 'floracion',
                    'cantidad': 30, 'unidad': 'm²',
                    'fecha_siembra': hoy - timedelta(days=60),
                    'fecha_estimada_cosecha': hoy + timedelta(days=30),
                    'estado': 'activo',
                }
            )

            from django.utils import timezone
            alertas = [
                (c_lech, 'riego',         timezone.now() + timedelta(hours=3),    'Riego por goteo — verificar presion y goteros', 'alta',  False),
                (c_lech, 'fertilizacion', timezone.now() + timedelta(days=3),     'Segunda aplicacion de biol foliar al 20%',      'media', False),
                (c_lech, 'cosecha',       timezone.now() + timedelta(days=20),    'Cosecha estimada de lechuga crespa',            'media', False),
                (c_tom,  'control',       timezone.now() - timedelta(days=1),     'Revision semanal de trips en flores de tomate', 'alta',  True),
                (c_tom,  'riego',         timezone.now() + timedelta(hours=6),    'Fertiriego con nitrato de calcio 2 g/L',        'alta',  False),
                (c_tom,  'cosecha',       timezone.now() + timedelta(days=30),    'Cosecha estimada tomate Rio Grande',            'baja',  False),
            ]
            for cult, tipo, fecha, desc, prio, comp in alertas:
                Alerta.objects.create(
                    cultivo=cult, tipo=tipo, fecha_programada=fecha,
                    descripcion=desc, prioridad=prio, completada=comp,
                )

        self.stdout.write('  Monitoreo y alertas creados')
