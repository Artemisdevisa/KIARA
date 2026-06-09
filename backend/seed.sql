-- ============================================================
-- SEED BIOHUERTO USAT — Data realista para kiara_db
-- Ejecutar en pgAdmin con Query Tool (F5)
-- ============================================================

-- Limpiar data existente (orden por FKs)
TRUNCATE TABLE
    campanas_practicasostenible,
    campanas_presupuestoitem,
    campanas_registroriego,
    campanas_planriego,
    campanas_registroaplicacion,
    campanas_itemfitosanitario,
    campanas_laborcampana,
    campanas_campana,
    campanas_plantillariego,
    campanas_plantillalabor,
    campanas_plantillaproducto,
    campanas_condicion,
    campanas_objetivo,
    campanas_plaga,
    campanas_unidadmedida,
    campanas_tipolabor,
    campanas_productoagricola,
    campanas_variedad,
    trazabilidad_practicasostenible,
    trazabilidad_costo,
    pedidos_itempedido,
    pedidos_pedido,
    diagnosticos_diagnostico,
    alertas_alerta,
    monitoreo_monitoreoregistro,
    cosechas_cosecha,
    cosechas_tipocosecha,
    cosechas_categoriacosecha,
    biohuertos_biohuertmiembro,
    biohuertos_documentobiohuerto,
    cultivos_cultivo,
    biohuertos_biohuerto,
    users_user_groups,
    users_user_user_permissions,
    users_user
RESTART IDENTITY CASCADE;

-- ============================================================
-- USUARIOS
-- ============================================================
-- Passwords hasheados con pbkdf2_sha256 (valor: Demo1234 / Admin1234)
INSERT INTO users_user (password, username, email, first_name, last_name, is_staff, is_superuser, is_active, date_joined, telefono, rol, roles, latitud, longitud)
VALUES
('pbkdf2_sha256$870000$admin$hashed', 'admin',    'admin@biohuerto.usat.pe',  'Admin',  'USAT',            true,  true,  true, NOW(), '',           'admin',     '[]', NULL, NULL),
('pbkdf2_sha256$870000$maria$hashed', 'maria_f',  'maria.flores@biohuerto.pe','Maria',  'Flores Llontop',  false, false, true, NOW(), '979123456',  'productor', '[]', NULL, NULL),
('pbkdf2_sha256$870000$carlo$hashed', 'carlos_r', 'carlos.ruiz@biohuerto.pe', 'Carlos', 'Ruiz Chavez',     false, false, true, NOW(), '968987654',  'productor', '[]', NULL, NULL);

-- ============================================================
-- BIOHUERTOS
-- ============================================================
INSERT INTO biohuertos_biohuerto (productor_id, nombre, codigo, ubicacion, area, descripcion, activo, departamento, provincia, distrito, latitud, longitud, created_at, updated_at)
VALUES
(2, 'Biohuerto San Isidro', 'BH-001', 'Urb. San Isidro, calle Los Alamos 145, Chiclayo',
 80.00, 'Biohuerto familiar agroecologico con produccion de hortalizas y hierbas para venta local.',
 true, 'Lambayeque', 'Chiclayo', 'Chiclayo', -6.771900, -79.840900, NOW(), NOW()),
(3, 'Biohuerto La Viña',    'BH-002', 'Sector La Viña, carretera Pimentel km 3.5, Chiclayo',
 150.00, 'Biohuerto semi-comercial con variedades de tomate, pimiento y maracuya.',
 true, 'Lambayeque', 'Chiclayo', 'Pimentel', -6.836200, -79.931400, NOW(), NOW());

-- ============================================================
-- VARIEDADES
-- ============================================================
INSERT INTO campanas_variedad (cultivo, nombre, subtipo, tipo_ciclo, dias_ciclo, descripcion)
VALUES
('Tomate',   'Rio Grande',        '',       'anual',   90,  'Tomate industrial, fruto ovalado firme, alta productividad. Ideal para produccion organica en costa norte.'),
('Tomate',   'Sweet 100',         'Cherry', 'anual',   80,  'Tomate cherry de alta dulzura. Racimos de 20-30 frutos. Muy demandado en mercados locales y bioferias.'),
('Lechuga',  'Crespa Verde',      '',       'anual',   45,  'Lechuga de hoja suelta, sabor suave. Ciclo corto ideal para produccion continua en biohuertos urbanos.'),
('Lechuga',  'Romana',            '',       'anual',   55,  'Lechuga de cabeza alargada, hojas crocantes. Buena tolerancia al calor de la costa lambayecana.'),
('Pimiento', 'California Wonder', '',       'anual',   75,  'Pimiento morron verde/rojo. Frutos grandes y carnosos, alta demanda en restaurantes de Chiclayo.'),
('Pepino',   'Marketer',          '',       'anual',   60,  'Pepino liso de piel fina, sabor fresco. Excelente rendimiento en climas calidos con riego eficiente.'),
('Cebolla',  'Roja Arequipena',   '',       'anual',  120,  'Cebolla de color rojo intenso, bulbo grande. Alta rentabilidad en mercados del norte del pais.'),
('Culantro', 'Criollo',           '',       'anual',   30,  'Hierba aromatica de ciclo ultracorto. Produccion continua con resiembra cada 3 semanas.'),
('Albahaca', 'Genovesa',          '',       'anual',   45,  'Albahaca clasica de hoja grande y aroma intenso. Muy solicitada para gastronomia local.'),
('Maracuya', 'Amarilla',          '',       'perenne', 365, 'Maracuya amarilla de alta acidez. Ciclo perenne de 3-4 anos, excelente para jugos y mercado regional.');

-- ============================================================
-- PRODUCTOS AGRICOLAS
-- ============================================================
INSERT INTO campanas_productoagricola (nombre, tipo, unidad, precio_unitario, descripcion, activo)
VALUES
('Compost organico maduro',          'enmienda',       'kg',  1.50, 'Compost de residuos vegetales y estiercol curado 3 meses. Mejora estructura del suelo.',     true),
('Humus de lombriz',                 'enmienda',       'kg',  2.00, 'Vermicompost de alta calidad. Rico en microorganismos beneficos y nutrientes disponibles.',   true),
('Biol fermentado',                  'bioestimulante', 'L',   5.00, 'Bioestimulante liquido de origen animal/vegetal. Aplicacion foliar al 20%.',                 true),
('Jabon potasico',                   'fitosanitario',  'L',  18.00, 'Insecticida de contacto organico. Eficaz contra pulgones, mosca blanca y arana roja.',       true),
('Trichoderma harzianum',            'biologico',      'kg', 25.00, 'Hongo benefico para control de patogenos del suelo. Previene damping-off.',                   true),
('Beauveria bassiana',               'biologico',      'kg', 30.00, 'Hongo entomopatogeno para control de insectos plagas. Eficaz contra mosca blanca y trips.',  true),
('Sulfato de cobre pentahidrato',    'fitosanitario',  'kg', 12.00, 'Fungicida preventivo y curativo. Control de mildiu, tizon y enfermedades fungicas.',         true),
('Nitrato de calcio',                'fertilizante',   'kg',  8.00, 'Fuente de calcio y nitrogeno de rapida asimilacion. Fortalece paredes celulares.',            true),
('Sulfato de magnesio',              'fertilizante',   'kg',  6.00, 'Fuente de magnesio y azufre. Corrige clorosis intervenal y mejora calidad de frutos.',        true),
('Extracto de algas Ascophyllum',    'bioestimulante', 'L',  35.00, 'Bioestimulante de algas marinas. Mejora cuajado de frutos y tolerancia a estres hidrico.',   true);

-- ============================================================
-- TIPOS DE LABOR
-- ============================================================
INSERT INTO campanas_tipolabor (codigo, nombre, tipo, unidad_default, costo_unitario_default, activo)
VALUES
('TL-0001', 'Preparacion y mullido de suelo',  'otro',       'jornal', 40.00, true),
('TL-0002', 'Siembra directa o trasplante',    'formacion',  'jornal', 40.00, true),
('TL-0003', 'Riego manual con manguera',       'riego',      'hora',    5.00, true),
('TL-0004', 'Fertilizacion foliar',            'aplicacion', 'hora',    8.00, true),
('TL-0005', 'Control fitosanitario foliar',    'aplicacion', 'hora',    8.00, true),
('TL-0006', 'Deshierbo y limpieza de camas',  'otro',       'jornal', 35.00, true),
('TL-0007', 'Poda de formacion y tutoraje',    'formacion',  'hora',    8.00, true),
('TL-0008', 'Poda de mantenimiento',           'poda',       'hora',    8.00, true),
('TL-0009', 'Cosecha y clasificacion',         'cosecha',    'jornal', 45.00, true),
('TL-0010', 'Instalacion sistema riego goteo', 'otro',       'hora',   12.00, true);

-- ============================================================
-- UNIDADES DE MEDIDA
-- ============================================================
INSERT INTO campanas_unidadmedida (codigo, nombre, tipo)
VALUES
('cc/L',  'Centimetros cubicos por litro de agua', 'vol_vol'),
('mL/L',  'Mililitros por litro de agua',          'vol_vol'),
('L/ha',  'Litros por hectarea',                   'vol_area'),
('L/m2',  'Litros por metro cuadrado',             'vol_area'),
('g/L',   'Gramos por litro de agua',              'masa_vol'),
('g/m2',  'Gramos por metro cuadrado',             'masa_area'),
('kg/ha', 'Kilogramos por hectarea',               'masa_area'),
('kg/m2', 'Kilogramos por metro cuadrado',         'masa_area');

-- ============================================================
-- PLAGAS
-- ============================================================
INSERT INTO campanas_plaga (nombre, nombre_cientifico, tipo, descripcion)
VALUES
('Pulgon verde',      'Myzus persicae',            'insecto',  'Insecto chupador en brotes tiernos. Transmite virus.'),
('Mosca blanca',      'Bemisia tabaci',            'insecto',  'Insecto chupador que debilita plantas y transmite geminivirus.'),
('Arana roja',        'Tetranychus urticae',       'acaro',    'Acaro que succiona contenido celular. Produce bronceado y defoliacion.'),
('Tizon tardio',      'Phytophthora infestans',    'hongo',    'Oomiceto devastador en solanaceas. Requiere humedad elevada.'),
('Mildiu velloso',    'Peronospora spp.',          'hongo',    'Hongo que ataca el enves de hojas con pelusa grisacea.'),
('Trips',             'Frankliniella occidentalis', 'insecto',  'Insecto minusculo que raspa epidermis y transmite TSWV.'),
('Minador de hoja',   'Liriomyza sativae',         'insecto',  'Larva que crea galeras en el mesofifo foliar.'),
('Nematodo del nudo', 'Meloidogyne incognita',     'nematodo', 'Nematodo que forma agallas en raices, reduce absorcion.');

-- ============================================================
-- OBJETIVOS
-- ============================================================
INSERT INTO campanas_objetivo (nombre, tipo, plaga_id)
VALUES
('Control de pulgon verde',       'control',       (SELECT id FROM campanas_plaga WHERE nombre='Pulgon verde')),
('Control de mosca blanca',       'control',       (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca')),
('Control de arana roja',         'control',       (SELECT id FROM campanas_plaga WHERE nombre='Arana roja')),
('Control de tizon tardio',       'control',       (SELECT id FROM campanas_plaga WHERE nombre='Tizon tardio')),
('Control de mildiu',             'control',       (SELECT id FROM campanas_plaga WHERE nombre='Mildiu velloso')),
('Control de trips',              'control',       (SELECT id FROM campanas_plaga WHERE nombre='Trips')),
('Prevencion de hongos del suelo','prevencion',    NULL),
('Fertilizacion foliar calcio',   'fertilizacion', NULL),
('Bioestimulacion radicular',     'estimulacion',  NULL);

-- ============================================================
-- CONDICIONES
-- ============================================================
INSERT INTO campanas_condicion (nombre, descripcion)
VALUES
('Aplicar antes de las 8 am',        'Evitar horas de mayor temperatura para reducir evaporacion y fitotoxicidad.'),
('Aplicar en ausencia de viento',    'Viento mayor a 15 km/h dispersa el producto y reduce eficacia.'),
('No aplicar con lluvia proxima',    'La lluvia lava el producto. Esperar 24 horas despues de lluvia.'),
('Aplicar cada 15 dias preventivo',  'Frecuencia preventiva para mantener poblaciones bajo umbral economico.'),
('Aplicar al inicio de floracion',   'Momento critico para cuajado y control de trips en flores.'),
('Mojar bien el enves de las hojas', 'Pulgones, arana roja y mosca blanca se ubican en el enves.');

-- ============================================================
-- CATEGORIAS Y TIPOS DE COSECHA
-- ============================================================
INSERT INTO cosechas_categoriacosecha (nombre, emoji, slug, orden)
VALUES
('Hortalizas', '🥬', 'hortalizas', 1),
('Frutas',     '🍊', 'frutas',     2),
('Hierbas',    '🌿', 'hierbas',    3);

INSERT INTO cosechas_tipocosecha (categoria_id, nombre, slug)
VALUES
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'), 'Tomate',   'tomate'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'), 'Lechuga',  'lechuga'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'), 'Pimiento', 'pimiento'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'), 'Pepino',   'pepino'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'), 'Cebolla',  'cebolla'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='frutas'),     'Maracuya', 'maracuya'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hierbas'),    'Culantro', 'culantro'),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hierbas'),    'Albahaca', 'albahaca');

-- ============================================================
-- CAMPANAS
-- ============================================================
INSERT INTO campanas_campana (biohuerto_id, variedad_id, codigo, anio, fecha_inicio, fecha_fin, area, unidad_area, estado, tipo_ciclo, objetivo_cosecha, unidad_cosecha, precio_venta_estimado, notas, created_at, updated_at)
VALUES
-- Bio1 (id=1): Lechuga Crespa, Culantro, Albahaca, Pimiento, Lechuga Romana cerrada
(1, (SELECT id FROM campanas_variedad WHERE cultivo='Lechuga'  AND nombre='Crespa Verde'),
 'CAMP-BH-001-LEC-2026', 2026, CURRENT_DATE-25, CURRENT_DATE+20,  12.0, 'm²', 'activa',    '', 36.0,  'kg', 4.50, 'Manejo 100% organico. Lechuga crespa para venta directa.', NOW(), NOW()),
(1, (SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 'CAMP-BH-001-CUL-2026', 2026, CURRENT_DATE-10, CURRENT_DATE+20,   5.0, 'm²', 'activa',    '', 10.0,  'kg', 3.00, 'Resiembra continua cada 3 semanas.', NOW(), NOW()),
(1, (SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 'CAMP-BH-001-ALB-2026', 2026, CURRENT_DATE-20, CURRENT_DATE+25,   4.0, 'm²', 'activa',    '',  8.0,  'kg', 6.00, 'Alta demanda en restaurantes chiclayanos.', NOW(), NOW()),
(1, (SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 'CAMP-BH-001-PIM-2026', 2026, CURRENT_DATE-50, CURRENT_DATE+25,  15.0, 'm²', 'activa',    '', 60.0,  'kg', 5.00, 'Produccion para mercado La Mosone y restaurantes.', NOW(), NOW()),
(1, (SELECT id FROM campanas_variedad WHERE cultivo='Lechuga'  AND nombre='Romana'),
 'CAMP-BH-001-ROM-2025', 2025, CURRENT_DATE-90, CURRENT_DATE-35,   8.0, 'm²', 'cerrada',   '', 20.0,  'kg', 4.00, 'Campaña cerrada. Rendimiento: 22 kg cosechados.', NOW(), NOW()),
-- Bio2 (id=2): Tomate Rio, Tomate Cherry, Pepino, Cebolla, Maracuya
(2, (SELECT id FROM campanas_variedad WHERE cultivo='Tomate'   AND nombre='Rio Grande'),
 'CAMP-BH-002-TOM-2026', 2026, CURRENT_DATE-60, CURRENT_DATE+30,  30.0, 'm²', 'activa',    '',120.0,  'kg', 3.50, 'Produccion para mercados mayoristas de Chiclayo.', NOW(), NOW()),
(2, (SELECT id FROM campanas_variedad WHERE cultivo='Tomate'   AND nombre='Sweet 100'),
 'CAMP-BH-002-CHE-2026', 2026, CURRENT_DATE-45, CURRENT_DATE+35,  10.0, 'm²', 'activa',    '', 50.0,  'kg', 7.00, 'Tomate cherry para bioferias y supermercados.', NOW(), NOW()),
(2, (SELECT id FROM campanas_variedad WHERE cultivo='Pepino'   AND nombre='Marketer'),
 'CAMP-BH-002-PEP-2026', 2026, CURRENT_DATE-30, CURRENT_DATE+30,  20.0, 'm²', 'activa',    '', 80.0,  'kg', 2.50, 'Alta rotacion. Demanda constante en mercados locales.', NOW(), NOW()),
(2, (SELECT id FROM campanas_variedad WHERE cultivo='Cebolla'  AND nombre='Roja Arequipena'),
 'CAMP-BH-002-CEB-2026', 2026, CURRENT_DATE-80, CURRENT_DATE+40,  25.0, 'm²', 'activa',    '',100.0,  'kg', 2.00, 'Cebolla roja de exportacion interna al sur del pais.', NOW(), NOW()),
(2, (SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 'CAMP-BH-002-MAR-2025', 2025, CURRENT_DATE-180,NULL,             40.0, 'm²', 'activa', 'perenne',200.0,'kg', 4.00, 'Cultivo perenne. Segunda temporada de produccion.', NOW(), NOW());

-- ============================================================
-- LABORES POR CAMPANA
-- ============================================================
-- Lechuga Crespa (campana 1)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion de camas con compost',         CURRENT_DATE-32,CURRENT_DATE-32,1,1,40.00,'Juan Perez',  'ejecutada',''),
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Trasplante de plantines de lechuga',        CURRENT_DATE-25,CURRENT_DATE-25,1,1,40.00,'Juan Perez',  'ejecutada',''),
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),'crecimiento','Deshierbo entre camas',                     CURRENT_DATE-11,CURRENT_DATE-11,1,1,35.00,'Maria Quispe','ejecutada',''),
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),'crecimiento','Fertilizacion foliar con biol al 20%',      CURRENT_DATE-10,CURRENT_DATE-10,2,2, 8.00,'Maria Quispe','ejecutada',''),
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),'floracion',  'Control preventivo pulgones con jabon',     CURRENT_DATE+5, NULL,           2,NULL,8.00,'Juan Perez',  'programada',''),
(1,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Cosecha y clasificacion por tamaño',         CURRENT_DATE+20,NULL,           2,NULL,45.00,'Juan Perez', 'programada','');

-- Culantro (campana 2)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(2,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion de bancales con humus',         CURRENT_DATE-17,CURRENT_DATE-17,1,1,40.00,'Juan Perez',  'ejecutada',''),
(2,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Siembra directa a chorro continuo',         CURRENT_DATE-10,CURRENT_DATE-10,1,1,40.00,'Maria Quispe','ejecutada',''),
(2,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Primera cosecha corte de hojas',             CURRENT_DATE+20,NULL,           1,NULL,45.00,'Juan Perez', 'programada','');

-- Albahaca (campana 3)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(3,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion sustrato con compost y humus',  CURRENT_DATE-27,CURRENT_DATE-27,1,1,40.00,'Juan Perez',  'ejecutada',''),
(3,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Trasplante plantines albahaca genovesa',    CURRENT_DATE-20,CURRENT_DATE-20,1,1,40.00,'Juan Perez',  'ejecutada',''),
(3,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),'crecimiento','Tutoraje y poda de puntas florales',        CURRENT_DATE-7, CURRENT_DATE-7, 2,2, 8.00,'Maria Quispe','ejecutada',''),
(3,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Cosecha de ramas para venta en atados',     CURRENT_DATE+25,NULL,           2,NULL,45.00,'Juan Perez', 'programada','');

-- Pimiento (campana 4)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion surcos con compost 5kg/m2',     CURRENT_DATE-57,CURRENT_DATE-57,1,1,40.00,'Juan Perez',  'ejecutada',''),
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Trasplante pimiento a 40cm entre plantas',  CURRENT_DATE-50,CURRENT_DATE-50,1,1,40.00,'Juan Perez',  'ejecutada',''),
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),'crecimiento','Tutoraje con rafia y estacas de bambu',     CURRENT_DATE-35,CURRENT_DATE-35,3,3, 8.00,'Maria Quispe','ejecutada',''),
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),'floracion',  'Fertiriego nitrato calcio 2g/L',            CURRENT_DATE-20,CURRENT_DATE-20,2,2, 8.00,'Maria Quispe','ejecutada',''),
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),'floracion',  'Control trips con beauveria bassiana',      CURRENT_DATE-10,CURRENT_DATE-10,2,2, 8.00,'Juan Perez',  'ejecutada',''),
(4,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Primera cosecha pimiento verde',            CURRENT_DATE+25,NULL,           2,NULL,45.00,'Juan Perez', 'programada','');

-- Tomate Rio Grande (campana 6)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion surcos dobles con compost',     CURRENT_DATE-67,CURRENT_DATE-67,2,2,40.00,'Carlos Ramos','ejecutada',''),
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Trasplante tomate a 50cm entre plantas',    CURRENT_DATE-60,CURRENT_DATE-60,1,1,40.00,'Carlos Ramos','ejecutada',''),
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),'crecimiento','Tutoraje con sistema holandés de rafia',    CURRENT_DATE-45,CURRENT_DATE-45,4,4, 8.00,'Carlos Ramos','ejecutada',''),
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0008'),'establecido','Poda de chupones y hojas basales',          CURRENT_DATE-30,CURRENT_DATE-30,3,3, 8.00,'Carlos Ramos','ejecutada',''),
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),'floracion',  'Aplicacion foliar sulfato magnesio 2g/L',  CURRENT_DATE-15,CURRENT_DATE-15,2,2, 8.00,'Carlos Ramos','ejecutada',''),
(6,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Primera cosecha tomate rojo maduro',        CURRENT_DATE+30,NULL,           4,NULL,45.00,'Carlos Ramos','programada','');

-- Tomate Cherry (campana 7)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(7,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion camas elevadas con compost',    CURRENT_DATE-52,CURRENT_DATE-52,1,1,40.00,'Carlos Ramos','ejecutada',''),
(7,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Trasplante cherry en linea doble',          CURRENT_DATE-45,CURRENT_DATE-45,1,1,40.00,'Carlos Ramos','ejecutada',''),
(7,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Cosecha continua de racimos cherry',        CURRENT_DATE+35,NULL,           4,NULL,45.00,'Carlos Ramos','programada','');

-- Pepino (campana 8)
INSERT INTO campanas_laborcampana (campana_id, tipo_labor_id, etapa, descripcion, fecha_programada, fecha_ejecutada, cantidad_programada, cantidad_ejecutada, costo_unitario, operario, estado, notas)
VALUES
(8,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),'preparacion','Preparacion camas con compost y humus',     CURRENT_DATE-37,CURRENT_DATE-37,1,1,40.00,'Carlos Ramos','ejecutada',''),
(8,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),'germinacion','Siembra directa pepino a 60cm',            CURRENT_DATE-30,CURRENT_DATE-30,1,1,40.00,'Carlos Ramos','ejecutada',''),
(8,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),'crecimiento','Tutoraje con malla treliça',               CURRENT_DATE-15,CURRENT_DATE-15,2,2, 8.00,'Carlos Ramos','ejecutada',''),
(8,(SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),'cosecha',    'Cosecha pepino en estado optimo',           CURRENT_DATE+30,NULL,           3,NULL,45.00,'Carlos Ramos','programada','');

-- ============================================================
-- PLAN FITOSANITARIO (por campana)
-- ============================================================
INSERT INTO campanas_itemfitosanitario (campana_id, producto_id, objetivo_id, plaga_id, dosis, unidad_id, dias_antes_cosecha, condicion_id, frecuencia_dias, fecha_inicio, etapa, estado, fecha_aplicada, activo)
VALUES
-- Campana 1 Lechuga
(1,(SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Control de pulgon verde'),
   (SELECT id FROM campanas_plaga WHERE nombre='Pulgon verde'),
   5.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='cc/L'),3,
   (SELECT id FROM campanas_condicion WHERE nombre='Mojar bien el enves de las hojas'),15,CURRENT_DATE-10,'crecimiento','programado',NULL,true),
(1,(SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
   NULL,2.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='cc/L'),0,
   (SELECT id FROM campanas_condicion WHERE nombre='Aplicar cada 15 dias preventivo'),14,CURRENT_DATE-10,'crecimiento','aplicado',CURRENT_DATE-10,true),
(1,(SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
   NULL,2.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),0,
   (SELECT id FROM campanas_condicion WHERE nombre='Aplicar cada 15 dias preventivo'),30,CURRENT_DATE-24,'preparacion','aplicado',CURRENT_DATE-24,true),
-- Campana 4 Pimiento
(4,(SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Control de trips'),
   (SELECT id FROM campanas_plaga WHERE nombre='Trips'),
   2.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),5,
   (SELECT id FROM campanas_condicion WHERE nombre='Aplicar antes de las 8 am'),15,CURRENT_DATE-10,'floracion','aplicado',CURRENT_DATE-10,true),
(4,(SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de cobre pentahidrato'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Control de mildiu'),
   (SELECT id FROM campanas_plaga WHERE nombre='Mildiu velloso'),
   3.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),7,
   (SELECT id FROM campanas_condicion WHERE nombre='Aplicar cada 15 dias preventivo'),21,CURRENT_DATE-20,'floracion','programado',NULL,true),
-- Campana 6 Tomate Rio Grande
(6,(SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
   (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
   5.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='cc/L'),3,
   (SELECT id FROM campanas_condicion WHERE nombre='Mojar bien el enves de las hojas'),15,CURRENT_DATE-50,'crecimiento','aplicado',CURRENT_DATE-45,true),
(6,(SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de cobre pentahidrato'),
   (SELECT id FROM campanas_objetivo WHERE nombre='Control de tizon tardio'),
   (SELECT id FROM campanas_plaga WHERE nombre='Tizon tardio'),
   3.0,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),7,
   (SELECT id FROM campanas_condicion WHERE nombre='Aplicar cada 15 dias preventivo'),21,CURRENT_DATE-40,'floracion','aplicado',CURRENT_DATE-35,true);

-- ============================================================
-- PLANES DE RIEGO
-- ============================================================
INSERT INTO campanas_planriego (campana_id, nombre, metodo, litros_por_m2, frecuencia_dias, duracion_minutos, fertilizante_id, dosis_fertilizante, fecha_inicio, fecha_fin, activo)
VALUES
(1,'Riego Lechuga - Goteo',   'goteo',  1.50,3,25,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,CURRENT_DATE-25,CURRENT_DATE+20,true),
(2,'Riego Culantro - Manual', 'manual', 1.00,2,15,NULL,NULL,CURRENT_DATE-10,CURRENT_DATE+20,true),
(3,'Riego Albahaca - Manual', 'manual', 1.20,2,20,NULL,NULL,CURRENT_DATE-20,CURRENT_DATE+25,true),
(4,'Riego Pimiento - Goteo',  'goteo',  2.50,3,30,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,CURRENT_DATE-50,CURRENT_DATE+25,true),
(6,'Riego Tomate - Goteo',    'goteo',  2.50,3,35,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.5,CURRENT_DATE-60,CURRENT_DATE+30,true),
(7,'Riego Cherry - Goteo',    'goteo',  2.00,3,25,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,CURRENT_DATE-45,CURRENT_DATE+35,true),
(8,'Riego Pepino - Goteo',    'goteo',  2.50,3,30,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,CURRENT_DATE-30,CURRENT_DATE+30,true),
(9,'Riego Cebolla - Gravedad','gravedad',2.00,4,40,NULL,NULL,CURRENT_DATE-80,CURRENT_DATE+40,true),
(10,'Riego Maracuya - Goteo', 'goteo',  3.00,4,45,(SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de magnesio'),1.5,CURRENT_DATE-180,NULL,true);

-- ============================================================
-- REGISTROS DE RIEGO (ultimas 3 aplicaciones por campana)
-- ============================================================
INSERT INTO campanas_registroriego (campana_id, plan_id, fecha, litros_aplicados, area_regada, costo_agua, fertilizante_id, dosis_fertilizante, operario, observaciones)
VALUES
(1,1,CURRENT_DATE-6, 18.00,12.0,0.022,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Juan Perez','Riego normal. Suelo en buen punto.'),
(1,1,CURRENT_DATE-3, 18.00,12.0,0.022,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Juan Perez','Se noto mayor vigor en plantas.'),
(1,1,CURRENT_DATE,   18.00,12.0,0.022,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Juan Perez','Riego al atardecer por calor.'),
(4,4,CURRENT_DATE-6, 37.50,15.0,0.045,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Juan Perez','Fertiriego. Buen cuajado de frutos.'),
(4,4,CURRENT_DATE-3, 37.50,15.0,0.045,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Juan Perez','Sin novedades.'),
(6,5,CURRENT_DATE-6, 75.00,30.0,0.090,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.5,'Carlos Ramos','Tomate en floracion, riego critico.'),
(6,5,CURRENT_DATE-3, 75.00,30.0,0.090,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.5,'Carlos Ramos','Buena respuesta al fertiriego.'),
(6,5,CURRENT_DATE,   75.00,30.0,0.090,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.5,'Carlos Ramos','Primeros frutos cuajados visibles.'),
(8,7,CURRENT_DATE-6, 50.00,20.0,0.060,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Carlos Ramos','Pepino en buen desarrollo vegetativo.'),
(8,7,CURRENT_DATE-3, 50.00,20.0,0.060,(SELECT id FROM campanas_productoagricola WHERE nombre='Nitrato de calcio'),2.0,'Carlos Ramos','Sin plagas visibles.'),
(10,9,CURRENT_DATE-8,120.00,40.0,0.144,(SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de magnesio'),1.5,'Carlos Ramos','Maracuya en produccion continua.');

-- ============================================================
-- PRESUPUESTO POR CAMPANA
-- ============================================================
INSERT INTO campanas_presupuestoitem (campana_id, categoria, descripcion, cantidad, unidad, precio_unitario, monto_ejecutado)
VALUES
-- Campana 1 — Lechuga Crespa Verde 12 m² — Presupuesto organico ≤ 600 sol
-- TOTAL PLAN: 540.30 sol | EJECUTADO: 348.35 sol (dia 25/45)
(1,'insumo',   'Compost organico maduro',  30.0,'kg',   1.50, 45.00),
(1,'insumo',   'Humus de lombriz',         12.0,'kg',   2.00, 24.00),
(1,'insumo',   'Plantines lechuga crespa',  1.0,'bandeja',15.00,15.00),
(1,'insumo',   'Biol fermentado',           0.30,'L',   5.00,  1.50),
(1,'insumo',   'Jabon potasico',            0.10,'L',  18.00,  0.90),
(1,'insumo',   'Trichoderma harzianum',     0.02,'kg', 25.00,  0.50),
(1,'agua',     'Agua riego aspersion',    675.0,'L',   0.0012, 0.45),
(1,'herramienta','Palos, hilo, etiquetas',  1.0,'kit', 20.00, 20.00),
(1,'mano_obra','Preparacion y acondicionamiento', 1.5,'jornal',40.00,60.00),
(1,'mano_obra','Trasplante y siembra',      1.0,'jornal',40.00,40.00),
(1,'mano_obra','Riegos manuales ciclo',    15.0,'hora',  5.00, 40.00),
(1,'mano_obra','Fertilizaciones y aplicaciones',6.0,'hora',8.00,24.00),
(1,'mano_obra','Deshierbo y limpieza',      1.0,'jornal',35.00,35.00),
(1,'mano_obra','Monitoreo y labores diversas',8.0,'hora', 8.00,32.00),
(1,'mano_obra','Cosecha y clasificacion',   1.5,'jornal',45.00, 0.00),
(1,'otro',     'Imprevistos 5%%',           1.0,'global',26.40, 0.00),
-- Campana 4 Pimiento
(4,'insumo',   'Compost organico maduro',   7.5,'kg',  1.50,11.25),
(4,'insumo',   'Humus de lombriz',          4.5,'kg',  2.00, 9.00),
(4,'insumo',   'Biol fermentado',           1.5,'L',   5.00, 7.50),
(4,'insumo',   'Beauveria bassiana',        0.3,'kg', 30.00, 9.00),
(4,'agua',     'Agua de riego por goteo',1125.0,'L',  0.0012, 1.35),
(4,'mano_obra','Preparacion y tutoraje',    4.0,'jornal',40.00,160.00),
(4,'mano_obra','Cosecha y clasificacion',   4.0,'jornal',45.00, 0.00),
-- Campana 6 Tomate Rio Grande
(6,'insumo',   'Compost organico maduro',  15.0,'kg',  1.50,22.50),
(6,'insumo',   'Humus de lombriz',          9.0,'kg',  2.00,18.00),
(6,'insumo',   'Biol fermentado',           3.0,'L',   5.00,15.00),
(6,'insumo',   'Jabon potasico',            1.5,'L',  18.00,27.00),
(6,'insumo',   'Sulfato de cobre',          0.9,'kg', 12.00,10.80),
(6,'agua',     'Agua de riego por goteo',2250.0,'L',  0.0012, 2.70),
(6,'mano_obra','Preparacion y tutoraje',    6.0,'jornal',40.00,240.00),
(6,'mano_obra','Podas y manejo',            6.0,'jornal', 8.00,48.00),
(6,'mano_obra','Cosecha y clasificacion',   8.0,'jornal',45.00, 0.00);

-- ============================================================
-- PRACTICAS SOSTENIBLES
-- ============================================================
INSERT INTO campanas_practicasostenible (campana_id, tipo, descripcion, fecha, cantidad, unidad)
VALUES
(1,'compost',          'Incorporacion de 6 kg compost maduro al voleo antes del trasplante.',   CURRENT_DATE-30, 6.0,'kg'),
(1,'sin_agroquimicos', 'Control de pulgones con jabon potasico organico, sin sinteticos.',       CURRENT_DATE-25, NULL,''),
(1,'riego_eficiente',  'Sistema de riego por goteo con fertirriego de nitrato de calcio.',       CURRENT_DATE-25, NULL,''),
(4,'compost',          'Aplicacion de 7.5 kg compost + 4.5 kg humus por metro cuadrado.',       CURRENT_DATE-55, 7.5,'kg'),
(4,'control_biologico','Liberacion de Beauveria bassiana para control de trips en floracion.',   CURRENT_DATE-10, 0.3,'kg'),
(4,'riego_eficiente',  'Fertiriego con nitrato de calcio via sistema de goteo tecnificado.',     CURRENT_DATE-50, NULL,''),
(6,'compost',          'Incorporacion profunda de 15 kg compost antes del trasplante de tomate.',CURRENT_DATE-65,15.0,'kg'),
(6,'sin_agroquimicos', 'Manejo fitosanitario con jabon potasico y sulfato de cobre (mineral).',  CURRENT_DATE-60, NULL,''),
(6,'riego_eficiente',  'Sistema de riego por goteo con fertirriego programado cada 3 dias.',     CURRENT_DATE-60, NULL,''),
(10,'abono_verde',     'Siembra de Crotalaria entre hileras de maracuya para fijacion N.',       CURRENT_DATE-120,NULL,''),
(10,'riego_eficiente', 'Riego por goteo con microaspersores en plantas perennes de maracuya.',   CURRENT_DATE-180,NULL,'');

-- ============================================================
-- COSECHAS PUBLICADAS (marketplace)
-- ============================================================
INSERT INTO cosechas_cosecha (categoria_id, biohuerto_id, cultivo_id, nombre_producto, cantidad, unidad, precio, fecha_cosecha, contacto, estado, created_at, updated_at)
VALUES
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'),1,NULL,'Lechuga crespa organica',   30,'unidades',1.50,CURRENT_DATE-2, 'WhatsApp: 979-123-456','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hierbas'),   1,NULL,'Culantro fresco criollo',   50,'atados',  0.80,CURRENT_DATE-1, 'WhatsApp: 979-123-456','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hierbas'),   1,NULL,'Albahaca genovesa fresca',  20,'atados',  1.00,CURRENT_DATE-3, 'WhatsApp: 979-123-456','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'),1,NULL,'Pimiento morron verde',     15,'kg',      5.00,CURRENT_DATE-5, 'WhatsApp: 979-123-456','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'),2,NULL,'Tomate Rio Grande organico',40,'kg',      3.50,CURRENT_DATE-4, 'WhatsApp: 968-987-654','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'),2,NULL,'Tomate cherry Sweet 100',   10,'kg',      7.00,CURRENT_DATE-2, 'WhatsApp: 968-987-654','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='hortalizas'),2,NULL,'Pepino fresco Marketer',    25,'kg',      2.50,CURRENT_DATE-3, 'WhatsApp: 968-987-654','disponible',NOW(),NOW()),
((SELECT id FROM cosechas_categoriacosecha WHERE slug='frutas'),    2,NULL,'Maracuya amarilla',         20,'kg',      4.00,CURRENT_DATE-1, 'WhatsApp: 968-987-654','disponible',NOW(),NOW());

-- ============================================================
-- MONITOREO
-- ============================================================
INSERT INTO monitoreo_monitoreoregistro (biohuerto_id, fecha, humedad, temperatura, luminosidad, incidencias, created_at)
VALUES
(1,CURRENT_DATE-4, 68,24.5,'alta', 'Sin novedades. Crecimiento uniforme en lechuga y pimiento.',NOW()),
(1,CURRENT_DATE-3, 70,24.0,'alta', 'Se observan pulgones en brotes de albahaca. Se aplico jabon potasico.',NOW()),
(1,CURRENT_DATE-2, 65,25.0,'media','Humedad optima. Deshierbo en camas de culantro.',NOW()),
(1,CURRENT_DATE-1, 72,23.5,'alta', 'Riego preventivo. Sin plagas visibles.',NOW()),
(1,CURRENT_DATE,   66,24.8,'alta', 'Aplicacion de biol foliar al 20%. Buena respuesta de las plantas.',NOW()),
(2,CURRENT_DATE-4, 60,26.0,'alta', 'Tomate Rio Grande en floracion. Cuajado excelente.',NOW()),
(2,CURRENT_DATE-3, 63,25.5,'media','Mosca blanca en pepino. Se aplico Beauveria bassiana.',NOW()),
(2,CURRENT_DATE-2, 58,27.0,'alta', 'Maracuya con buen desarrollo vegetativo. Riego por goteo.',NOW()),
(2,CURRENT_DATE-1, 61,26.5,'alta', 'Tomate cherry en cosecha. Produccion continua de racimos.',NOW()),
(2,CURRENT_DATE,   64,25.0,'media','Aplicacion sulfato de cobre preventivo en tomate Rio Grande.',NOW());

-- ============================================================
-- CULTIVOS (para alertas)
-- ============================================================
INSERT INTO cultivos_cultivo (biohuerto_id, nombre, tipo_ciclo, fecha_siembra, etapa, cantidad, unidad, fecha_estimada_cosecha, notas, estado, created_at, updated_at)
VALUES
(1,'Lechuga Crespa Verde','anual', CURRENT_DATE-25,'crecimiento',12,'m²',CURRENT_DATE+20,'Variedad crespa. Buen desarrollo, sin plagas visibles.','activo',NOW(),NOW()),
(2,'Tomate Rio Grande',   'anual', CURRENT_DATE-60,'floracion',  30,'m²',CURRENT_DATE+30,'En plena floracion. Cuajado excelente.','activo',NOW(),NOW());

-- ============================================================
-- ALERTAS
-- ============================================================
INSERT INTO alertas_alerta (cultivo_id, tipo, fecha_programada, descripcion, prioridad, completada, created_at)
VALUES
(1,'riego',        NOW()+INTERVAL '3 hours',  'Riego por goteo — verificar presion y goteros', 'alta', false,NOW()),
(1,'fertilizacion',NOW()+INTERVAL '3 days',   'Segunda aplicacion de biol foliar al 20%',      'media',false,NOW()),
(1,'cosecha',      NOW()+INTERVAL '20 days',  'Cosecha estimada de lechuga crespa',            'media',false,NOW()),
(2,'control',      NOW()-INTERVAL '1 day',    'Revision semanal de trips en flores de tomate', 'alta', true, NOW()),
(2,'riego',        NOW()+INTERVAL '6 hours',  'Fertiriego con nitrato de calcio 2 g/L',        'alta', false,NOW()),
(2,'cosecha',      NOW()+INTERVAL '30 days',  'Cosecha estimada tomate Rio Grande',            'baja', false,NOW());

-- ============================================================
-- PLANTILLA LABORES (PlantillaLabor)
-- 5-8 labores por variedad, adaptadas a clima Lambayeque
-- Columnas: variedad_id, tipo_labor_id, cantidad, semana_relativa, etapa, notas
-- ============================================================
INSERT INTO campanas_plantillalabor (variedad_id, tipo_labor_id, cantidad, semana_relativa, etapa, notas) VALUES

-- ── Tomate Rio Grande ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Analisis de suelo y subsolado a 30 cm'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),2,0,'preparacion','Incorporacion de compost maduro 3 kg/m2 y humus 1 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante de plantines con 15 cm de altura'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,3,'crecimiento','Primera aplicacion biol foliar al 20% para enraizamiento'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,6,'floracion','Tutoraje y podas de chupones laterales'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),1,8,'fructificacion','Aplicacion extracto de algas para cuaje de frutos'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,11,'cosecha','Cosecha escalonada cada 3-4 dias, fruto firme color rojo'),

-- ── Tomate Sweet 100 (Cherry) ─────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Preparacion camas elevadas 20 cm, mezcla tierra+compost'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),2,0,'preparacion','Aplicacion humus de lombriz 1.5 kg/m2 en fondo de surco'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante a distancia 40 cm entre plantas'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,4,'crecimiento','Instalacion de espaldera y tutoraje de tallos'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),1,7,'floracion','Control preventivo Beauveria bassiana contra trips'),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,10,'cosecha','Cosecha continua de racimos, manejar con cuidado'),

-- ── Lechuga Crespa Verde (presupuesto objetivo ≤ 600 sol / 12 m²) ──
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),0.5,0,'preparacion','Preparacion de bancal fino a 15 cm, pH 6.0-7.0 — medio dia'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),0.5,0,'preparacion','Incorporacion compost 2.5 kg/m2 + humus 1 kg/m2 — medio dia'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante o siembra directa a chorro continuo, tapar 0.5 cm'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,2,'crecimiento','Fertilizacion foliar biol 10% — 1 hora aplicacion'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),0.5,4,'crecimiento','Deshierbo manual entre plantas — medio dia'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,6,'cosecha','Corte a nivel del suelo en horas frescas de la manana'),

-- ── Lechuga Romana ────────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Suelo suelto profundidad 15 cm, sin terrones'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),1,0,'preparacion','Incorporacion humus de lombriz 1 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante plantines de 5 cm con pellets de turba'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,3,'crecimiento','Aplicacion Trichoderma al suelo al momento de transplante'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,7,'cosecha','Cosecha cuando cogollo firme, cortar toda la planta'),

-- ── Pimiento California Wonder ────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Subsolado profundo y nivelacion de parcela'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),2,0,'preparacion','Mezcla compost 2 kg/m2 + humus 0.5 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante plantines de 20 cm con cepellon'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,3,'crecimiento','Primera poda de formacion, dejar 2-3 tallos principales'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,6,'floracion','Polinizacion manual en horas de mayor temperatura'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),1,9,'fructificacion','Control Beauveria bassiana para trips en flores'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,10,'cosecha','Cosecha fruto verde-maduro, cortar con tijera'),

-- ── Pepino Marketer ───────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Preparacion surcos elevados para buen drenaje'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),2,0,'preparacion','Incorporacion compost 2.5 kg/m2 previo a siembra'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Siembra directa 2 semillas por hoyo a 1 cm profundidad'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,3,'crecimiento','Instalacion de malla tutorera 1.8 m de altura'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),1,5,'floracion','Aplicacion extracto de algas para cuaje de pepinos'),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,8,'cosecha','Cosecha antes de amarillamiento, fruto firme 20 cm'),

-- ── Cebolla Roja Arequipena ───────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Arado profundo y surcado a 25 cm entre filas'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),2,0,'preparacion','Aplicacion compost maduro 3 kg/m2 + humus 1 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante almacigo 45 dias, bulbo recto vertical'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,4,'crecimiento','Aporque y abono foliar con biol 15%'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0008'),1,8,'crecimiento','Rascadillo y deshierbo manual entre surcos'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0009'),1,14,'maduracion','Suspension de riego 10 dias antes de cosecha'),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,16,'cosecha','Arranque manual y curado al sol 5 dias'),

-- ── Culantro Criollo ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Preparacion eras de 1 m de ancho, suelo mullido'),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),1,0,'preparacion','Incorporacion compost fino 1.5 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,0,'siembra','Siembra directa al voleo o en lineas a 10 cm'),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,2,'crecimiento','Aclareo dejando planta cada 5 cm'),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,4,'cosecha','Corte hojas externas o planta entera con raiz'),

-- ── Albahaca Genovesa ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Suelo bien drenado, pH 6.0-7.5, rico en materia organica'),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),1,0,'preparacion','Incorporacion humus de lombriz 1 kg/m2'),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante plantines de almacigo o siembra directa'),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,2,'crecimiento','Pinzado de apice para ramificacion y mayor hoja'),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,4,'floracion','Desbotonado continuo de flores para prolongar cosecha'),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,6,'cosecha','Corte ramas antes de floracion completa, madrugada'),

-- ── Maracuya Amarilla ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0001'),1,0,'preparacion','Hoyos 40x40x40 cm distancia 3x3 m, mezcla tierra+compost'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0002'),3,0,'preparacion','Aplicacion compost 5 kg/hoyo + humus 2 kg/hoyo'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,1,'siembra','Transplante plantines con 30 cm en bolsa de vivero'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0005'),1,4,'crecimiento','Instalacion espaldera alambre galvanizado, postes 2.5 m'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0004'),1,8,'floracion','Poda de formacion y guiado de tallos primarios'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0006'),1,12,'fructificacion','Aplicacion biol + extracto algas para cuaje frutos'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0007'),1,20,'cosecha','Cosecha frutos caidos al suelo o con red recolectora'),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0010'),1,52,'mantenimiento','Poda de renovacion anual post-cosecha mayor'),

-- ── Lechuga Crespa Verde — etapas adicionales ─────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0003'),1,0,'germinacion','Riego ligero 2 veces al dia para mantener humedad de germinacion, no inundar'),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_tipolabor WHERE codigo='TL-0008'),1,5,'floracion','Eliminacion de tallos florales (espigado) para evitar amargor en hojas');

-- ============================================================
-- PLANTILLA PRODUCTOS FITOSANITARIOS (PlantillaProducto)
-- Solo insumos organicos permitidos en Lambayeque
-- Columnas: variedad_id, producto_id, objetivo_id, plaga_id,
--           dosis, unidad_id, dias_antes_cosecha, frecuencia_dias,
--           condicion_id, etapa
-- ============================================================
INSERT INTO campanas_plantillaproducto
  (variedad_id, producto_id, objetivo_id, plaga_id, dosis, unidad_id,
   dias_antes_cosecha, frecuencia_dias, condicion_id, etapa) VALUES

-- ── Tomate Rio Grande ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 7,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de trips'),
 (SELECT id FROM campanas_plaga WHERE nombre='Trips'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 3,7,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'floracion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de pulgon verde'),
 (SELECT id FROM campanas_plaga WHERE nombre='Pulgon verde'),
 10,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 1,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de cobre pentahidrato'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de tizon tardio'),
 (SELECT id FROM campanas_plaga WHERE nombre='Tizon tardio'),
 2,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 7,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='No aplicar con lluvia proxima'),
 'fructificacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 20,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

-- ── Tomate Sweet 100 (Cherry) ─────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 3,7,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de arana roja'),
 (SELECT id FROM campanas_plaga WHERE nombre='Arana roja'),
 15,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 1,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'fructificacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar al inicio de floracion'),
 'floracion'),

-- ── Lechuga Crespa Verde (dosis reducidas para presupuesto ≤ 600 sol) ──
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de pulgon verde'),
 (SELECT id FROM campanas_plaga WHERE nombre='Pulgon verde'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 3,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 10,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 7,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

-- ── Lechuga Romana ────────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de trips'),
 (SELECT id FROM campanas_plaga WHERE nombre='Trips'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 5,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar en ausencia de viento'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 15,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 7,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

-- ── Pimiento California Wonder ────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de trips'),
 (SELECT id FROM campanas_plaga WHERE nombre='Trips'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 5,7,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'floracion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
 12,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 3,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar al inicio de floracion'),
 'floracion'),

-- ── Pepino Marketer ───────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de arana roja'),
 (SELECT id FROM campanas_plaga WHERE nombre='Arana roja'),
 15,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 2,7,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'fructificacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar al inicio de floracion'),
 'floracion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 3,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar en ausencia de viento'),
 'crecimiento'),

-- ── Cebolla Roja Arequipena ───────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 21,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de trips'),
 (SELECT id FROM campanas_plaga WHERE nombre='Trips'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 7,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 20,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 14,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de cobre pentahidrato'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mildiu'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mildiu velloso'),
 2,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='No aplicar con lluvia proxima'),
 'maduracion'),

-- ── Culantro Criollo ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 10,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 7,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de pulgon verde'),
 (SELECT id FROM campanas_plaga WHERE nombre='Pulgon verde'),
 8,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 3,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 NULL,
 5,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

-- ── Albahaca Genovesa ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 15,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 7,14,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Jabon potasico'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
 8,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 3,10,
 (SELECT id FROM campanas_condicion WHERE descripcion='Mojar bien el enves de las hojas'),
 'crecimiento'),

((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar en ausencia de viento'),
 'crecimiento'),

-- ── Maracuya Amarilla ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Prevencion de hongos del suelo'),
 (SELECT id FROM campanas_plaga WHERE nombre='Nematodo del nudo'),
 8,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'preparacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Beauveria bassiana'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mosca blanca'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mosca blanca'),
 3,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 5,7,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar antes de las 8 am'),
 'floracion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Bioestimulacion radicular'),
 NULL,
 4,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,21,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar al inicio de floracion'),
 'floracion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Fertilizacion foliar calcio'),
 NULL,
 20,(SELECT id FROM campanas_unidadmedida WHERE codigo='mL/L'),
 0,15,
 (SELECT id FROM campanas_condicion WHERE descripcion='Aplicar cada 15 dias preventivo'),
 'fructificacion'),

((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 (SELECT id FROM campanas_productoagricola WHERE nombre='Sulfato de cobre pentahidrato'),
 (SELECT id FROM campanas_objetivo WHERE nombre='Control de mildiu'),
 (SELECT id FROM campanas_plaga WHERE nombre='Mildiu velloso'),
 2,(SELECT id FROM campanas_unidadmedida WHERE codigo='g/L'),
 14,30,
 (SELECT id FROM campanas_condicion WHERE descripcion='No aplicar con lluvia proxima'),
 'fructificacion');

-- ============================================================
-- PLANTILLA RIEGO (PlantillaRiego)
-- 3 planes por variedad (vegetativo / productivo / fertiriego)
-- Columnas: variedad_id, nombre, metodo, litros_por_m2,
--           frecuencia_dias, duracion_minutos, fertilizante_id,
--           dosis_fertilizante, etapa, semana_relativa
-- ============================================================
INSERT INTO campanas_plantillariego
  (variedad_id, nombre, metodo, litros_por_m2, frecuencia_dias,
   duracion_minutos, fertilizante_id, dosis_fertilizante, etapa, semana_relativa) VALUES

-- ── Tomate Rio Grande ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 'Riego establecimiento goteo','goteo',2.5,2,30,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 5,'preparacion',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 'Fertiriego biol floracion','goteo',3.0,2,35,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 20,'floracion',6),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Rio Grande'),
 'Fertiriego algas cuaje','goteo',3.5,2,40,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 3,'fructificacion',9),

-- ── Tomate Sweet 100 (Cherry) ─────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 'Riego establecimiento microaspersion','microaspersion',2.0,2,25,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 5,'preparacion',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 'Fertiriego biol vegetativo','goteo',2.5,2,30,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 15,'crecimiento',3),
((SELECT id FROM campanas_variedad WHERE cultivo='Tomate' AND nombre='Sweet 100'),
 'Fertiriego algas fructificacion','goteo',3.0,2,35,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 3,'fructificacion',8),

-- ── Lechuga Crespa Verde (riego reducido para presupuesto ≤ 600 sol) ──
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 'Riego aspersion siembra','aspersion',2.0,1,12,
 NULL,0,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 'Fertiriego biol crecimiento','aspersion',2.0,2,12,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 8,'crecimiento',2),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Crespa Verde'),
 'Riego goteo pre-cosecha','goteo',1.5,2,15,
 NULL,0,'cosecha',5),

-- ── Lechuga Romana ────────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 'Riego aspersion siembra','aspersion',3.0,1,15,
 NULL,0,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 'Fertiriego biol crecimiento','aspersion',3.0,1,15,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 10,'crecimiento',2),
((SELECT id FROM campanas_variedad WHERE cultivo='Lechuga' AND nombre='Romana'),
 'Riego goteo compactacion','goteo',1.5,2,20,
 NULL,0,'cosecha',6),

-- ── Pimiento California Wonder ────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 'Riego establecimiento goteo','goteo',2.5,2,30,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 5,'preparacion',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 'Fertiriego biol vegetativo','goteo',3.0,2,35,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 20,'crecimiento',4),
((SELECT id FROM campanas_variedad WHERE cultivo='Pimiento' AND nombre='California Wonder'),
 'Fertiriego algas floracion','goteo',3.5,2,40,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 3,'floracion',7),

-- ── Pepino Marketer ───────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 'Riego goteo siembra','goteo',3.0,1,25,
 NULL,0,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 'Fertiriego biol trepadora','goteo',3.5,2,30,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 15,'crecimiento',3),
((SELECT id FROM campanas_variedad WHERE cultivo='Pepino' AND nombre='Marketer'),
 'Fertiriego algas cuaje','goteo',4.0,2,35,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 3,'fructificacion',6),

-- ── Cebolla Roja Arequipena ───────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 'Riego surco transplante','surco',5.0,3,45,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 5,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 'Fertiriego biol engrosamiento','surco',4.0,3,40,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 20,'crecimiento',6),
((SELECT id FROM campanas_variedad WHERE cultivo='Cebolla' AND nombre='Roja Arequipena'),
 'Riego reducido maduracion','goteo',1.5,5,20,
 NULL,0,'maduracion',14),

-- ── Culantro Criollo ──────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 'Riego manual germinacion','manual',2.0,1,10,
 NULL,0,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 'Fertiriego biol foliar','aspersion',2.0,1,10,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 10,'crecimiento',2),
((SELECT id FROM campanas_variedad WHERE cultivo='Culantro' AND nombre='Criollo'),
 'Riego goteo pre-corte','goteo',1.5,2,15,
 NULL,0,'cosecha',3),

-- ── Albahaca Genovesa ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 'Riego aspersion establecimiento','aspersion',2.5,1,15,
 NULL,0,'siembra',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 'Fertiriego biol macollamiento','aspersion',2.5,1,15,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 10,'crecimiento',2),
((SELECT id FROM campanas_variedad WHERE cultivo='Albahaca' AND nombre='Genovesa'),
 'Riego goteo pre-cosecha','goteo',2.0,2,20,
 NULL,0,'cosecha',5),

-- ── Maracuya Amarilla ─────────────────────────────────────────
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 'Riego goteo establecimiento','goteo',4.0,3,45,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Trichoderma harzianum'),
 8,'preparacion',0),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 'Fertiriego biol crecimiento vigoroso','goteo',5.0,2,50,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Biol fermentado'),
 20,'crecimiento',8),
((SELECT id FROM campanas_variedad WHERE cultivo='Maracuya' AND nombre='Amarilla'),
 'Fertiriego algas cuaje pasion','goteo',5.0,2,50,
 (SELECT id FROM campanas_productoagricola WHERE nombre='Extracto de algas Ascophyllum'),
 4,'floracion',20);
