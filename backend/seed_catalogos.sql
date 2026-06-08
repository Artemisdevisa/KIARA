-- =============================================================
--  SEED: Catálogos base — Variedades, Productos, Tipos de labor
--  Ejecutar con SQLite:    sqlite3 db.sqlite3 < seed_catalogos.sql
--  Ejecutar con PostgreSQL: psql -d biohuerto_db -f seed_catalogos.sql
-- =============================================================

-- ─────────────────────────────────────────────────────────────
--  VARIEDADES
--  Tabla: campanas_variedad
--  Campos: cultivo, nombre, subtipo, tipo_ciclo, dias_ciclo, descripcion
-- ─────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO campanas_variedad (cultivo, nombre, subtipo, tipo_ciclo, dias_ciclo, descripcion) VALUES

-- LECHUGA (anual)
('Lechuga', 'Batavia',  '',         'anual', 60,  'Hoja crespa, resistente al calor, muy cultivada en la costa peruana'),
('Lechuga', 'Romana',   '',         'anual', 65,  'Hoja alargada, textura crujiente, tolerante a temperaturas moderadas'),
('Lechuga', 'Crespa',   'Verde',    'anual', 55,  'Hoja rizada verde, ciclo corto, ideal para biohuertos pequeños'),
('Lechuga', 'Crespa',   'Morada',   'anual', 55,  'Hoja rizada morada, valor ornamental y nutricional alto'),

-- TOMATE (anual)
('Tomate',  'Río Grande','',        'anual', 90,  'Tomate industrial, fruto ovalado, alta producción, resistente a enfermedades'),
('Tomate',  'Cherry',    'Rojo',    'anual', 75,  'Fruto pequeño rojo, sabor dulce concentrado, muy cotizado en mercados'),
('Tomate',  'Momotaro',  '',        'anual', 85,  'Variedad japonesa, fruto redondo rosado, piel fina y carnoso'),
('Tomate',  'Larga Vida','',        'anual', 95,  'Larga vida postcosecha, fruto firme, adecuado para transporte'),

-- PIMIENTO (anual)
('Pimiento','California Wonder','', 'anual', 80,  'Fruto cuadrangular verde/rojo, grueso, apto para exportación'),
('Pimiento','Paprika',   '',        'anual', 90,  'Pimiento seco para páprika, alta demanda agroindustrial'),
('Pimiento','Piquillo',  '',        'anual', 85,  'Pimiento triangular, dulce, mercado gourmet y conservas'),

-- PEPINO (anual)
('Pepino',  'Largo Verde','',       'anual', 55,  'Fruto alargado, piel fina, mercado local y autoconsumo'),
('Pepino',  'Japonés',   '',        'anual', 50,  'Fruto delgado sin semillas, muy apreciado en supermercados'),

-- ZAPALLO (anual)
('Zapallo', 'Macre',     '',        'anual', 120, 'Zapallo tipo macre, pulpa anaranjada firme, muy popular en la costa'),
('Zapallo', 'Loche',     '',        'anual', 110, 'Endémico de Lambayeque, aroma y sabor únicos, producto bandera'),

-- MAÍZ (anual)
('Maíz',   'Choclero',  'Blanco',  'anual', 120, 'Maíz de grano blanco grande, consumo fresco y exportación'),
('Maíz',   'Morado',    '',        'anual', 150, 'Maíz pigmentado, alto valor nutraceutico, chicha morada'),
('Maíz',   'Amarillo duro','',     'anual', 130, 'Maíz para forraje e industria avícola'),

-- CEBOLLA (anual)
('Cebolla', 'Roja Arequipeña','',  'anual', 120, 'Bulbo rojo intenso, sabor fuerte, líder en el mercado peruano'),
('Cebolla', 'Amarilla',  '',       'anual', 110, 'Sabor suave, apreciada para exportación a mercados europeos'),
('Cebolla', 'Blanca',    '',       'anual', 105, 'Sabor dulce, uso culinario fresco y en conservas'),

-- FRIJOL (anual)
('Frijol',  'Castilla',  'Negro',  'anual', 90,  'Grano negro, alto contenido proteico, mercado interno y exportación'),
('Frijol',  'Canario',   '',       'anual', 95,  'Grano amarillo dorado, muy consumido en la gastronomía peruana'),
('Frijol',  'Loctao',    '',       'anual', 70,  'Frijol de soya verde, ciclo corto, creciente demanda'),

-- PAPA (anual)
('Papa',    'Canchán',   '',       'anual', 120, 'Resistente a rancha, piel rosada, muy producida en sierra media'),
('Papa',    'Huayro',    '',       'anual', 150, 'Papa nativa, pulpa amarilla rojiza, alta demanda gourmet'),
('Papa',    'Amarilla',  'Tumbay', 'anual', 130, 'Papa nativa de Huancayo, textura harinosa, mercado premium'),

-- ESPINACA (anual)
('Espinaca','Viroflay',  '',       'anual', 45,  'Hoja grande y tierna, ciclo muy corto, ideal biohuerto urbano'),
('Espinaca','Baby leaf', '',       'anual', 30,  'Hojas pequeñas para ensaladas, alta rotación, mercado moderno'),

-- RABANITO (anual)
('Rabanito','Crimson Giant','',    'anual', 30,  'Raíz roja grande, ciclo muy corto, ideal para inicio de biohuerto'),
('Rabanito','Blanco Largo','',     'anual', 35,  'Raíz blanca alargada, sabor suave, mercado local'),

-- PALTA (perenne)
('Palta',   'Hass',      '',       'perenne', NULL, 'Variedad más exportada del Perú, piel rugosa oscura, cremosa y rica en grasa'),
('Palta',   'Fuerte',    '',       'perenne', NULL, 'Piel lisa verde, sabor suave, buena postcosecha'),
('Palta',   'Zutano',    '',       'perenne', NULL, 'Polinizadora tipo B, fruto alargado, piel verde brillante'),

-- MANGO (perenne)
('Mango',   'Kent',      '',       'perenne', NULL, 'Principal variedad exportada, fruto oval grande, sin fibra'),
('Mango',   'Edward',    '',       'perenne', NULL, 'Fruto redondo sin fibra, muy apreciado en mercados europeos'),
('Mango',   'Haden',     '',       'perenne', NULL, 'Piel rojo-amarilla, sabor intenso, mercado nacional'),

-- UVA (perenne)
('Uva',     'Red Globe', '',       'perenne', NULL, 'Uva de mesa roja, grano grande con semilla, consumo fresco'),
('Uva',     'Crimson Seedless','', 'perenne', NULL, 'Uva roja sin semilla, alta demanda exportación'),
('Uva',     'Flame Seedless','',   'perenne', NULL, 'Uva roja oscura sin semilla, sabor dulce'),
('Uva',     'Sweet Globe','',      'perenne', NULL, 'Uva verde sin semilla, grano esférico, premium export'),

-- LIMÓN (perenne)
('Limón',   'Sutil',     '',       'perenne', NULL, 'Limón peruano por excelencia, ácido, pequeño, muy aromático'),
('Limón',   'Tahití',    '',       'perenne', NULL, 'Limón sin semilla, piel gruesa, mayor rendimiento de jugo'),

-- ESPÁRRAGO (perenne)
('Espárrago','UC-157',   '',       'perenne', NULL, 'Variedad predominante en La Libertad y Ica, turión grueso'),
('Espárrago','Atlas',    '',       'perenne', NULL, 'Turión verde erecto, alta densidad de siembra posible'),

-- MARACUYÁ (perenne)
('Maracuyá','Amarilla',  '',       'perenne', NULL, 'Mayor rendimiento, fruto ovalado amarillo, alto contenido de jugo'),
('Maracuyá','Morada',    '',       'perenne', NULL, 'Fruto redondo morado, sabor más suave, mercado premium'),

-- ARÁNDANO (perenne)
('Arándano','Biloxi',    '',       'perenne', NULL, 'Variedad de bajo requerimiento de frío, adaptada a costa peruana'),
('Arándano','Emerald',   '',       'perenne', NULL, 'Fruto grande y firme, excepcional vida postcosecha para exportación'),

-- PAPAYA (perenne)
('Papaya',  'Maradol',   '',       'perenne', NULL, 'Fruto grande alargado, pulpa rojo-anaranjada, mercado interno'),
('Papaya',  'Hawaiian Solo','',    'perenne', NULL, 'Fruto pequeño, ideal autoconsumo y mercados diferenciados');


-- ─────────────────────────────────────────────────────────────
--  PRODUCTOS AGRÍCOLAS
--  Tabla: campanas_productoagricola
--  Campos: nombre, tipo, unidad, precio_unitario, descripcion, activo
-- ─────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO campanas_productoagricola (nombre, tipo, unidad, precio_unitario, descripcion, activo) VALUES

-- FITOSANITARIOS
('Abamectina 1.8% EC',      'fitosanitario', 'L',   85.00, 'Acaricida-insecticida, control de ácaros y minadores de hoja',           1),
('Clorpirifos 48% EC',      'fitosanitario', 'L',   45.00, 'Insecticida organofosforado, amplio espectro, control de suelo y follaje',1),
('Deltametrina 2.5% EC',    'fitosanitario', 'L',   38.00, 'Piretroide de contacto e ingestión, control de lepidópteros y coleópteros',1),
('Imidacloprid 35% SC',     'fitosanitario', 'L',   95.00, 'Neonicotinoide sistémico, control de mosca blanca, pulgones y trips',    1),
('Azoxystrobin 25% SC',     'fitosanitario', 'L',  120.00, 'Fungicida sistémico, control preventivo y curativo de oidio y botrytis', 1),
('Mancozeb 80% WP',         'fitosanitario', 'kg',  28.00, 'Fungicida de contacto, control de mildiu y alternaria',                  1),
('Oxicloruro de cobre 50%', 'fitosanitario', 'kg',  22.00, 'Fungicida-bactericida cúprico, preventivo, amplio espectro',             1),
('Iprodione 50% WP',        'fitosanitario', 'kg',  65.00, 'Fungicida dicarboximida, control de botrytis y esclerotinia',            1),
('Spinosad 48% SC',         'fitosanitario', 'L',  180.00, 'Insecticida biológico derivado de Saccharopolyspora spinosa',            1),
('Metamidofos 60% SL',      'fitosanitario', 'L',   42.00, 'Insecticida-acaricida sistémico y de contacto, uso restringido',         1),
('Cyhexatin 25% WP',        'fitosanitario', 'kg',  75.00, 'Acaricida específico para ácaros tetraniquidos',                         1),
('Propiconazol 25% EC',     'fitosanitario', 'L',   88.00, 'Fungicida triazol sistémico, control de roya y oidio',                   1),

-- FERTILIZANTES
('Urea 46%',                'fertilizante',  'kg',   2.20, 'Fuente de nitrógeno 46%, rápida disponibilidad, aplicación foliar y suelo',1),
('Nitrato de amonio 33%',   'fertilizante',  'kg',   2.50, 'Nitrógeno nítrico y amoniacal, liberación rápida',                       1),
('Fosfato diamónico DAP',   'fertilizante',  'kg',   3.20, 'Fuente de N y P, alta solubilidad, inicio de campaña',                   1),
('Cloruro de potasio 60%',  'fertilizante',  'kg',   2.80, 'Principal fuente de K, calidad de fruto y resistencia',                  1),
('Sulfato de potasio 50%',  'fertilizante',  'kg',   4.50, 'K sin cloro, ideal para cultivos sensibles y exportación',               1),
('Nitrato de calcio 15.5%', 'fertilizante',  'kg',   3.50, 'Calcio y nitrógeno, firmeza de fruto y prevención de podredumbre apical',1),
('Sulfato de magnesio',     'fertilizante',  'kg',   2.10, 'Fuente de Mg y S, corrección de deficiencias en suelos arenosos',        1),
('Ácido fosfórico 85%',     'fertilizante',  'L',    8.50, 'Fertirrigación, baja pH agua y aporta fósforo soluble',                  1),
('Nitrato de potasio 13-0-46','fertilizante','kg',   5.80, 'Fertirrigación, aporte de N y K sin cloro, etapa de fructificación',     1),
('MAP Monofosfato amónico', 'fertilizante',  'kg',   4.20, 'Alta pureza para fertirrigación, fuente de P y N',                       1),
('Sulfato de zinc',         'fertilizante',  'kg',   4.50, 'Micronutriente Zn, corrección de deficiencias en frutales',              1),
('Ácido bórico 17%',        'fertilizante',  'kg',   6.80, 'Fuente de boro, amarre y calidad de fruto en frutales',                  1),

-- BIOESTIMULANTES / BIOINSUMOS
('Aminoácidos hidrolizados 40%','bioestimulante','L', 45.00,'Estimula metabolismo vegetal, recuperación tras estrés',                1),
('Ácido giberélico 10%',    'bioestimulante', 'L',  120.00, 'Elongación de entrenudos, cuaje de frutos, aumento de calibre',         1),
('Algas marinas Ascophyllum','bioestimulante','L',   55.00, 'Citoquininas naturales, mejora cuaje y calidad de fruto',                1),
('Trichoderma harzianum',   'bioestimulante', 'kg',  35.00, 'Hongo biocontrolador de patógenos de suelo (Fusarium, Pythium)',         1),
('Bacillus subtilis',       'bioestimulante', 'L',   65.00, 'Bacteria biocontroladora, supresión de enfermedades foliares',           1),
('Beauveria bassiana',      'bioestimulante', 'kg',  45.00, 'Hongo entomopatógeno, control biológico de insectos plaga',              1),
('Ácido húmico + fúlvico',  'bioestimulante', 'L',   18.00, 'Mejora estructura del suelo y absorción de nutrientes',                  1),
('Silicio soluble',         'bioestimulante', 'L',   32.00, 'Fortalece pared celular, tolerancia a estrés y enfermedades',            1),

-- OTROS (materia orgánica, acondicionadores)
('Compost orgánico',        'otro',           'kg',   0.80, 'Materia orgánica estabilizada, mejora estructura y biología del suelo',  1),
('Humus de lombriz',        'otro',           'kg',   1.20, 'Abono orgánico rico en microorganismos y nutrientes disponibles',        1),
('Guano de isla',           'otro',           'kg',   3.50, 'Fertilizante orgánico peruano de alto valor, N-P-K natural',             1),
('Tierra de diatomeas',     'otro',           'kg',  18.00, 'Control físico de insectos rastreros, sin residuos químicos',            1),
('Carbonato de calcio agrícola','otro',        'kg',   0.60, 'Corrector de acidez, aporta calcio, mejora estructura arcillosa',        1);


-- ─────────────────────────────────────────────────────────────
--  TIPOS DE LABOR
--  Tabla: campanas_tipolabor
--  Campos: codigo, nombre, tipo, unidad_default, costo_unitario_default, activo
-- ─────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO campanas_tipolabor (codigo, nombre, tipo, unidad_default, costo_unitario_default, activo) VALUES

-- PREPARACIÓN Y SIEMBRA
('LB-001', 'Preparación de suelo (subsolado)',    'otro',       'hora',   35.00, 1),
('LB-002', 'Preparación de suelo (rastreado)',    'otro',       'hora',   30.00, 1),
('LB-003', 'Surcado y formación de camas',        'otro',       'hora',   25.00, 1),
('LB-004', 'Siembra directa',                     'otro',       'hora',   20.00, 1),
('LB-005', 'Trasplante de plantines',             'otro',       'hora',   22.00, 1),
('LB-006', 'Repique y resiembra',                 'otro',       'hora',   20.00, 1),

-- FORMACIÓN DE PLANTA
('LB-007', 'Poda de formación',                   'formacion',  'hora',   28.00, 1),
('LB-008', 'Poda de mantenimiento',               'poda',       'hora',   25.00, 1),
('LB-009', 'Poda sanitaria',                      'poda',       'hora',   25.00, 1),
('LB-010', 'Poda de renovación',                  'poda',       'hora',   30.00, 1),
('LB-011', 'Deshoje (eliminación hojas viejas)',   'formacion',  'hora',   20.00, 1),
('LB-012', 'Raleo de frutos',                     'formacion',  'hora',   22.00, 1),
('LB-013', 'Amarre y tutoraje',                   'formacion',  'hora',   20.00, 1),
('LB-014', 'Aporque',                             'otro',       'hora',   22.00, 1),

-- RIEGO
('LB-015', 'Riego manual (regadera/manguera)',    'riego',      'hora',   18.00, 1),
('LB-016', 'Instalación sistema goteo',           'riego',      'hora',   40.00, 1),
('LB-017', 'Mantenimiento sistema de riego',      'riego',      'hora',   30.00, 1),
('LB-018', 'Fertirrigación',                      'riego',      'hora',   22.00, 1),

-- APLICACIONES
('LB-019', 'Aplicación fitosanitaria foliar',     'aplicacion', 'hora',   25.00, 1),
('LB-020', 'Aplicación fitosanitaria al suelo',   'aplicacion', 'hora',   25.00, 1),
('LB-021', 'Fertilización foliar',                'aplicacion', 'hora',   22.00, 1),
('LB-022', 'Incorporación materia orgánica',      'aplicacion', 'hora',   20.00, 1),

-- MANEJO DE MALEZAS
('LB-023', 'Deshierbo manual',                    'otro',       'hora',   18.00, 1),
('LB-024', 'Deshierbo químico (herbicida)',        'otro',       'hora',   20.00, 1),
('LB-025', 'Acolchado (mulch)',                   'otro',       'hora',   22.00, 1),

-- MONITOREO Y EVALUACIÓN
('LB-026', 'Monitoreo de plagas y enfermedades',  'otro',       'hora',   20.00, 1),
('LB-027', 'Muestreo y análisis de suelo',        'otro',       'muestra',150.00, 1),
('LB-028', 'Evaluación fenológica',               'otro',       'hora',   20.00, 1),

-- COSECHA Y POSTCOSECHA
('LB-029', 'Cosecha manual',                      'cosecha',    'hora',   28.00, 1),
('LB-030', 'Clasificación y selección',           'cosecha',    'hora',   22.00, 1),
('LB-031', 'Empaque y embalaje',                  'cosecha',    'hora',   22.00, 1),
('LB-032', 'Transporte interno (campo-almacén)',  'cosecha',    'hora',   25.00, 1);
