-- ============================================================
-- Campaña Lechuga Crespa — Artemis Vidaurre Santistevan
-- Usuario  : artemisdevisa | artemisdevisa@gmail.com
-- Teléfono : 912017445
-- Hoy      : 2026-06-10
-- Inicio   : 2026-06-09 (CURRENT_DATE-1)
-- Fin      : 2026-07-24 (45 días de ciclo)
-- ============================================================
-- Ejecutar en pgAdmin → Query Tool (F5) conectado a kiara_db
-- ============================================================

DO $$
DECLARE
    v_user_id    INTEGER;
    v_bio_id     INTEGER;
    v_campana_id INTEGER;
BEGIN

-- ── 1. Verificar usuario ────────────────────────────────────────
SELECT id INTO v_user_id
FROM users_user
WHERE username = 'artemisdevisa';

IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario artemisdevisa no encontrado en la base de datos.';
END IF;
RAISE NOTICE 'Usuario artemisdevisa encontrado: id=%', v_user_id;

-- ── 2. Biohuerto (crea si no existe para este usuario) ──────────
SELECT id INTO v_bio_id
FROM biohuertos_biohuerto
WHERE codigo = 'BH-ART-001';

IF v_bio_id IS NULL THEN
    INSERT INTO biohuertos_biohuerto (
        productor_id, nombre, codigo, ubicacion, area, descripcion,
        activo, departamento, provincia, distrito,
        latitud, longitud, created_at, updated_at
    )
    VALUES (
        v_user_id,
        'Biohuerto Vidaurre',
        'BH-ART-001',
        'Urb. Los Precursores Mz. C Lt. 8, Chiclayo',
        30.00,
        'Biohuerto familiar agroecológico con producción de hortalizas y hierbas aromáticas. Manejo 100% orgánico sin agroquímicos.',
        true,
        'Lambayeque', 'Chiclayo', 'Chiclayo',
        -6.7714, -79.8409,
        NOW(), NOW()
    )
    RETURNING id INTO v_bio_id;
    RAISE NOTICE 'Biohuerto creado: id=%', v_bio_id;
ELSE
    RAISE NOTICE 'Biohuerto ya existe: id=%', v_bio_id;
END IF;

-- ── 3. Campaña ──────────────────────────────────────────────────
INSERT INTO campanas_campana (
    biohuerto_id, variedad_id, codigo, anio,
    fecha_inicio, fecha_fin,
    area, unidad_area, estado, tipo_ciclo,
    numero_ciclo,
    objetivo_cosecha, unidad_cosecha,
    precio_venta_estimado, notas,
    created_at, updated_at
)
VALUES (
    v_bio_id,
    (SELECT id FROM campanas_variedad WHERE cultivo = 'Lechuga' AND nombre = 'Crespa Verde'),
    'CAMP-ART-LEC-2026-01',
    2026,
    CURRENT_DATE - 1,   -- 2026-06-09
    CURRENT_DATE + 44,  -- 2026-07-24
    12.0, 'm²',
    'activa', 'anual',
    1,
    36.0, 'kg',
    4.50,
    'Campaña de lechuga crespa en manejo orgánico. Riego por goteo. Meta: 3 kg/m² en 45 días. Libre de agroquímicos.',
    NOW(), NOW()
)
RETURNING id INTO v_campana_id;
RAISE NOTICE 'Campaña creada: id=% (CAMP-ART-LEC-2026-01)', v_campana_id;

-- ── 4. Labores ──────────────────────────────────────────────────
-- Diseño con alertas:
--   • TL-0006 del 2026-06-08 (ayer) sin ejecutar → alerta ALTA (labor atrasada)
--   • TL-0004 del 2026-06-12 (+2 días)           → alerta ALTA (≤2 días)
--   • TL-0005 del 2026-06-15 (+5 días)           → alerta MEDIA
--   • TL-0006 del 2026-06-24 (+14 días)          → alerta BAJA
--   • TL-0009 del 2026-07-20 (+40 días)          → alerta BAJA (cosecha)

INSERT INTO campanas_laborcampana (
    campana_id, tipo_labor_id, etapa, descripcion,
    fecha_programada, fecha_ejecutada,
    cantidad_programada, cantidad_ejecutada,
    costo_unitario, operario, estado, es_sostenible, notas
)
VALUES
-- EJECUTADAS ─────────────────────────────────────────────────
(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0001'),
 'preparacion',
 'Preparación y mullido de camas con compost maduro 5 kg/m². Surcado a 25 cm entre hileras.',
 CURRENT_DATE - 3, CURRENT_DATE - 3,
 1, 1, 40.00, 'Artemis Vidaurre', 'ejecutada', true, 'Suelo suelto y bien aireado.'),

(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0002'),
 'germinacion',
 'Trasplante de plantines de lechuga crespa a 25 cm entre plantas y 30 cm entre hileras.',
 CURRENT_DATE - 1, CURRENT_DATE - 1,
 1, 1, 40.00, 'Artemis Vidaurre', 'ejecutada', true, 'Plantines de 3 semanas, buen vigor radicular.'),

-- ATRASADA ─────────────────────────────────────────────────── → ALERTA ALTA
(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0006'),
 'germinacion',
 'Deshierbo inicial post-trasplante. Eliminar malezas entre camas para evitar competencia hídrica y nutricional.',
 CURRENT_DATE - 2, NULL,
 1, NULL, 35.00, 'Artemis Vidaurre', 'programada', true, 'Pendiente — no se realizó en la fecha programada.'),

-- PRÓXIMAS ────────────────────────────────────────────────────
(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0004'),
 'crecimiento',
 'Fertilización foliar con biol fermentado al 20%. Aplicar a primeras horas de la mañana.',
 CURRENT_DATE + 2, NULL,
 2, NULL, 8.00, 'Artemis Vidaurre', 'programada', true, ''),  -- → ALERTA ALTA (≤2 días)

(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0005'),
 'crecimiento',
 'Control preventivo de pulgones con jabón potásico. Cubrir bien el envés de las hojas.',
 CURRENT_DATE + 5, NULL,
 2, NULL, 8.00, 'Artemis Vidaurre', 'programada', false, ''),  -- → ALERTA MEDIA (≤5 días)

(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0006'),
 'crecimiento',
 'Segundo deshierbo. Remoción de malezas y aireación del sustrato para mejorar absorción de nutrientes.',
 CURRENT_DATE + 14, NULL,
 1, NULL, 35.00, 'Artemis Vidaurre', 'programada', true, ''),

(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0004'),
 'floracion',
 'Segunda fertilización foliar con biol. Refuerzo nutricional en etapa de engrosamiento de hojas.',
 CURRENT_DATE + 25, NULL,
 2, NULL, 8.00, 'Artemis Vidaurre', 'programada', true, ''),

(v_campana_id,
 (SELECT id FROM campanas_tipolabor WHERE codigo = 'TL-0009'),
 'cosecha',
 'Cosecha completa. Corte a ras del cuello de la raíz. Clasificar por tamaño y peso, embolsar para venta directa.',
 CURRENT_DATE + 40, NULL,
 2, NULL, 45.00, 'Artemis Vidaurre', 'programada', true, 'Meta: mínimo 32 kg en 12 m².');

-- ── 5. Plan fitosanitario ────────────────────────────────────────
-- Alertas que se generarán al hacer clic en "Generar alertas":
--   • Jabón potásico  : seguridad (límite = fin - 3d = 2026-07-21) + control cada 15d
--   • Beauveria       : seguridad (límite = fin - 7d = 2026-07-17) + control cada 21d
--   • Biol fermentado : control cada 14d (próxima = 2026-06-23)

INSERT INTO campanas_itemfitosanitario (
    campana_id, producto_id, objetivo_id, plaga_id,
    dosis, unidad_id,
    dias_antes_cosecha, condicion_id,
    frecuencia_dias, fecha_inicio,
    etapa, estado, fecha_aplicada,
    operario, es_sostenible, observaciones, activo
)
VALUES
-- 1. Trichoderma harzianum — aplicado en preparación (control biológico, sostenible)
(v_campana_id,
 (SELECT id FROM campanas_productoagricola WHERE nombre ILIKE '%Trichoderma%' LIMIT 1),
 (SELECT id FROM campanas_objetivo WHERE nombre ILIKE '%hongos%' LIMIT 1),
 NULL,
 2.0,
 (SELECT id FROM campanas_unidadmedida WHERE codigo = 'g/L'),
 0,
 (SELECT id FROM campanas_condicion WHERE nombre ILIKE '%15 dias%' LIMIT 1),
 NULL, CURRENT_DATE - 3,
 'preparacion', 'aplicado', CURRENT_DATE - 3,
 'Artemis Vidaurre', true, '', true),

-- 2. Jabón potásico — periódico cada 15d, pendiente
--    Intervalo seguridad = 3 días → límite aplicación = 2026-07-21
(v_campana_id,
 (SELECT id FROM campanas_productoagricola WHERE nombre ILIKE '%Jabon%' OR nombre ILIKE '%Jabón%' LIMIT 1),
 (SELECT id FROM campanas_objetivo WHERE nombre ILIKE '%pulgon%' OR nombre ILIKE '%pulgón%' LIMIT 1),
 (SELECT id FROM campanas_plaga WHERE nombre ILIKE '%Pulgon%' OR nombre ILIKE '%Pulgón%' LIMIT 1),
 5.0,
 (SELECT id FROM campanas_unidadmedida WHERE codigo = 'cc/L'),
 3,
 (SELECT id FROM campanas_condicion WHERE nombre ILIKE '%enves%' OR nombre ILIKE '%envés%' LIMIT 1),
 15, CURRENT_DATE - 1,
 'crecimiento', 'programado', NULL,
 '', false, '', true),

-- 3. Biol fermentado — aplicado en trasplante, recurrente cada 14 días
--    Próxima aplicación: 2026-06-09 + 14 = 2026-06-23 (en 13 días)
(v_campana_id,
 (SELECT id FROM campanas_productoagricola WHERE nombre ILIKE '%Biol%' LIMIT 1),
 (SELECT id FROM campanas_objetivo WHERE nombre ILIKE '%Bioestimulac%' LIMIT 1),
 NULL,
 2.0,
 (SELECT id FROM campanas_unidadmedida WHERE codigo = 'cc/L'),
 0,
 (SELECT id FROM campanas_condicion WHERE nombre ILIKE '%15 dias%' LIMIT 1),
 14, CURRENT_DATE - 1,
 'crecimiento', 'aplicado', CURRENT_DATE - 1,
 'Artemis Vidaurre', true, '', true),

-- 4. Beauveria bassiana — preventivo para trips, pendiente, intervalo seguridad=7 días
--    Límite aplicación = 2026-07-17 (en 37 días)
(v_campana_id,
 (SELECT id FROM campanas_productoagricola WHERE nombre ILIKE '%Beauveria%' LIMIT 1),
 (SELECT id FROM campanas_objetivo WHERE nombre ILIKE '%trips%' LIMIT 1),
 (SELECT id FROM campanas_plaga WHERE nombre ILIKE '%trips%' OR nombre ILIKE '%Trips%' LIMIT 1),
 2.0,
 (SELECT id FROM campanas_unidadmedida WHERE codigo = 'g/L'),
 7,
 (SELECT id FROM campanas_condicion WHERE nombre ILIKE '%8 am%' LIMIT 1),
 21, CURRENT_DATE + 9,
 'crecimiento', 'programado', NULL,
 '', true, '', true);

-- ── 6. Plan de riego ─────────────────────────────────────────────
-- Plan 1 goteo diario: completado=false → generará alerta "Riego pendiente: hoy"
-- Plan 2 aspersión semanal: fecha_inicio=2026-06-16, no hay pendiente aún

INSERT INTO campanas_planriego (
    campana_id, nombre, metodo,
    litros_por_m2, frecuencia_dias, duracion_minutos,
    fertilizante_id, dosis_fertilizante,
    fecha_inicio, fecha_fin, operario,
    completado, es_sostenible, activo
)
VALUES
-- Riego por goteo diario — completado=false → generará alerta "Riego pendiente: hoy"
(v_campana_id,
 'Riego por goteo — mañana diaria', 'goteo',
 0.5, 1, 20,
 NULL, NULL,
 CURRENT_DATE - 1, CURRENT_DATE + 44, 'Artemis Vidaurre',
 false, true, true),

-- Fertiriego semanal con biol (inicia el 16/jun)
(v_campana_id,
 'Fertiriego semanal con biol', 'aspersion',
 1.0, 7, 15,
 (SELECT id FROM campanas_productoagricola WHERE nombre ILIKE '%Biol%' LIMIT 1), 0.5,
 CURRENT_DATE + 6, CURRENT_DATE + 43, 'Artemis Vidaurre',
 false, true, true);

-- ── 7. Presupuesto ──────────────────────────────────────────────
INSERT INTO campanas_presupuestoitem (
    campana_id, categoria, descripcion,
    cantidad, unidad, precio_unitario, monto_ejecutado
)
VALUES
(v_campana_id,'insumo',     'Compost orgánico maduro',             30.0, 'kg',      1.50,  45.00),
(v_campana_id,'insumo',     'Plantines lechuga crespa (bandeja)',   1.0, 'bandeja', 15.00,  15.00),
(v_campana_id,'insumo',     'Biol fermentado',                      0.30,'L',       5.00,   1.50),
(v_campana_id,'insumo',     'Jabón potásico',                       0.10,'L',      18.00,   0.00),
(v_campana_id,'insumo',     'Trichoderma harzianum',                0.02,'kg',     25.00,   0.50),
(v_campana_id,'insumo',     'Beauveria bassiana',                   0.02,'kg',     30.00,   0.00),
(v_campana_id,'agua',       'Agua riego goteo ciclo completo',    540.0, 'L',      0.0012,  0.65),
(v_campana_id,'herramienta','Kit tutores y etiquetas',              1.0, 'kit',    20.00,  20.00),
(v_campana_id,'mano_obra',  'Preparación y acondicionamiento',      1.5, 'jornal', 40.00,  60.00),
(v_campana_id,'mano_obra',  'Trasplante',                           1.0, 'jornal', 40.00,  40.00),
(v_campana_id,'mano_obra',  'Riegos manuales supervisión',         10.0, 'hora',    5.00,   8.00),
(v_campana_id,'mano_obra',  'Fertilizaciones y aplicaciones',       6.0, 'hora',    8.00,  16.00),
(v_campana_id,'mano_obra',  'Deshierbo x2',                         2.0, 'jornal', 35.00,   0.00),
(v_campana_id,'mano_obra',  'Cosecha y clasificación',              1.5, 'jornal', 45.00,   0.00),
(v_campana_id,'otro',       'Imprevistos 5%',                       1.0, 'global', 15.00,   0.00);

RAISE NOTICE '✓ Todo listo. Campaña id=% creada para artemisdevisa (bio id=%)', v_campana_id, v_bio_id;
RAISE NOTICE '  → Ir a /campanas/% y hacer clic en "Generar alertas" para ver las alertas.', v_campana_id;
END $$;
