-- =============================================================
-- BIOHUERTO USAT - Esquema completo de base de datos
-- Motor: SQLite (Django ORM)
-- Generado desde: backend/apps/*/models.py
-- =============================================================

-- -------------------------------------------------------------
-- TABLAS INTERNAS DE DJANGO
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS django_migrations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    app         TEXT NOT NULL,
    name        TEXT NOT NULL,
    applied     TEXT NOT NULL  -- DateTimeField
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    app_label TEXT NOT NULL,
    model     TEXT NOT NULL,
    UNIQUE (app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    content_type_id INTEGER NOT NULL REFERENCES django_content_type (id),
    codename        TEXT NOT NULL,
    UNIQUE (content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id      INTEGER NOT NULL REFERENCES auth_group (id),
    permission_id INTEGER NOT NULL REFERENCES auth_permission (id),
    UNIQUE (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS django_session (
    session_key  TEXT PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date  TEXT NOT NULL  -- DateTimeField
);

CREATE TABLE IF NOT EXISTS django_admin_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    action_time     TEXT    NOT NULL,  -- DateTimeField
    object_id       TEXT,
    object_repr     TEXT    NOT NULL,
    action_flag     INTEGER NOT NULL,
    change_message  TEXT    NOT NULL,
    content_type_id INTEGER REFERENCES django_content_type (id),
    user_id         INTEGER NOT NULL   -- FK a users_user (definida abajo)
);

-- -------------------------------------------------------------
-- APP: users  →  modelo User (extiende AbstractUser)
-- Tabla: users_user
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users_user (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Campos de AbstractUser
    password     TEXT    NOT NULL,
    last_login   TEXT,                          -- DateTimeField, nullable
    is_superuser INTEGER NOT NULL DEFAULT 0,    -- BooleanField
    username     TEXT    NOT NULL UNIQUE,
    first_name   TEXT    NOT NULL DEFAULT '',
    last_name    TEXT    NOT NULL DEFAULT '',
    email        TEXT    NOT NULL DEFAULT '',
    is_staff     INTEGER NOT NULL DEFAULT 0,
    is_active    INTEGER NOT NULL DEFAULT 1,
    date_joined  TEXT    NOT NULL,              -- DateTimeField
    -- Campos propios
    telefono     TEXT    NOT NULL DEFAULT '',   -- max_length=20
    rol          TEXT    NOT NULL DEFAULT 'productor'
                         CHECK (rol IN ('productor','consumidor','admin'))
);

-- Relación M2M User <-> Group
CREATE TABLE IF NOT EXISTS users_user_groups (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users_user (id),
    group_id INTEGER NOT NULL REFERENCES auth_group (id),
    UNIQUE (user_id, group_id)
);

-- Relación M2M User <-> Permission
CREATE TABLE IF NOT EXISTS users_user_user_permissions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users_user (id),
    permission_id INTEGER NOT NULL REFERENCES auth_permission (id),
    UNIQUE (user_id, permission_id)
);

-- FK diferida: django_admin_log → users_user
-- (declarada aquí porque users_user ya existe)

-- -------------------------------------------------------------
-- APP: biohuertos  →  modelo Biohuerto
-- Tabla: biohuertos_biohuerto
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS biohuertos_biohuerto (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    productor_id INTEGER NOT NULL REFERENCES users_user (id),
    nombre       TEXT    NOT NULL,              -- max_length=200
    codigo       TEXT    NOT NULL DEFAULT '',   -- max_length=50, blank=True
    ubicacion    TEXT    NOT NULL,              -- TextField
    area         NUMERIC(10,2) NOT NULL,        -- DecimalField
    descripcion  TEXT    NOT NULL DEFAULT '',   -- TextField, blank=True
    activo       INTEGER NOT NULL DEFAULT 1,    -- BooleanField
    created_at   TEXT    NOT NULL,              -- DateTimeField auto_now_add
    updated_at   TEXT    NOT NULL               -- DateTimeField auto_now
);

-- -------------------------------------------------------------
-- APP: cultivos  →  modelo Cultivo
-- Tabla: cultivos_cultivo
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cultivos_cultivo (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    biohuerto_id          INTEGER NOT NULL REFERENCES biohuertos_biohuerto (id),
    nombre                TEXT    NOT NULL,                       -- max_length=200
    fecha_siembra         TEXT    NOT NULL,                       -- DateField
    etapa                 TEXT    NOT NULL DEFAULT 'germinacion'
                                  CHECK (etapa IN ('germinacion','crecimiento','floracion','cosecha')),
    cantidad              NUMERIC(10,2) NOT NULL,
    unidad                TEXT    NOT NULL DEFAULT 'm²',          -- max_length=50
    fecha_estimada_cosecha TEXT   NOT NULL,                       -- DateField
    notas                 TEXT    NOT NULL DEFAULT '',
    estado                TEXT    NOT NULL DEFAULT 'activo'
                                  CHECK (estado IN ('activo','cosechado','perdido')),
    created_at            TEXT    NOT NULL,
    updated_at            TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: monitoreo  →  modelo MonitoreoRegistro
-- Tabla: monitoreo_monitoreoregistro
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS monitoreo_monitoreoregistro (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    biohuerto_id INTEGER NOT NULL REFERENCES biohuertos_biohuerto (id),
    fecha        TEXT    NOT NULL,              -- DateField
    humedad      NUMERIC(5,2),                  -- nullable
    temperatura  NUMERIC(5,2),                  -- nullable
    luminosidad  TEXT    NOT NULL DEFAULT ''
                         CHECK (luminosidad IN ('','alta','media','baja')),
    incidencias  TEXT    NOT NULL DEFAULT '',
    created_at   TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: alertas  →  modelo Alerta
-- Tabla: alertas_alerta
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS alertas_alerta (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    cultivo_id       INTEGER NOT NULL REFERENCES cultivos_cultivo (id),
    tipo             TEXT    NOT NULL
                             CHECK (tipo IN ('riego','fertilizacion','control','cosecha','rotacion','otro')),
    fecha_programada TEXT    NOT NULL,          -- DateTimeField
    descripcion      TEXT    NOT NULL DEFAULT '',
    prioridad        TEXT    NOT NULL DEFAULT 'media'
                             CHECK (prioridad IN ('alta','media','baja')),
    completada       INTEGER NOT NULL DEFAULT 0, -- BooleanField
    created_at       TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: diagnosticos  →  modelo Diagnostico
-- Tabla: diagnosticos_diagnostico
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS diagnosticos_diagnostico (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    cultivo_id           INTEGER NOT NULL REFERENCES cultivos_cultivo (id),
    parte_afectada       TEXT    NOT NULL,      -- max_length=100
    sintomas             TEXT    NOT NULL DEFAULT '[]', -- JSONField → TEXT en SQLite
    diagnostico_probable TEXT    NOT NULL,      -- max_length=300
    causa_probable       TEXT    NOT NULL,
    recomendacion        TEXT    NOT NULL,
    fecha                TEXT    NOT NULL,      -- DateField auto_now_add
    created_at           TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: cosechas  →  modelos CategoriaCosecha, TipoCosecha, Cosecha
-- Tablas: cosechas_categoriacosecha, cosechas_tipocosecha, cosechas_cosecha
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cosechas_categoriacosecha (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT    NOT NULL,           -- max_length=100
    emoji  TEXT    NOT NULL DEFAULT '🌱', -- max_length=10
    slug   TEXT    NOT NULL UNIQUE,    -- SlugField
    orden  INTEGER NOT NULL DEFAULT 0  -- PositiveSmallIntegerField
);

CREATE TABLE IF NOT EXISTS cosechas_tipocosecha (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL REFERENCES cosechas_categoriacosecha (id),
    nombre       TEXT    NOT NULL,     -- max_length=100
    slug         TEXT    NOT NULL,     -- SlugField
    UNIQUE (categoria_id, slug)
);

CREATE TABLE IF NOT EXISTS cosechas_cosecha (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id   INTEGER          REFERENCES cosechas_categoriacosecha (id), -- SET_NULL, nullable
    biohuerto_id   INTEGER NOT NULL  REFERENCES biohuertos_biohuerto (id),
    cultivo_id     INTEGER          REFERENCES cultivos_cultivo (id),           -- SET_NULL, nullable
    nombre_producto TEXT   NOT NULL,            -- max_length=200
    foto           TEXT,                        -- ImageField → ruta relativa, nullable
    cantidad       NUMERIC(10,2) NOT NULL,
    unidad         TEXT    NOT NULL DEFAULT 'kg'
                           CHECK (unidad IN ('kg','unidades','atados','cajas')),
    precio         NUMERIC(10,2) NOT NULL,
    fecha_cosecha  TEXT    NOT NULL,            -- DateField
    contacto       TEXT    NOT NULL,            -- max_length=200
    estado         TEXT    NOT NULL DEFAULT 'disponible'
                           CHECK (estado IN ('disponible','agotado')),
    created_at     TEXT    NOT NULL,
    updated_at     TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: trazabilidad  →  modelo PracticaSostenible
-- Tabla: trazabilidad_practicasostenible
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trazabilidad_practicasostenible (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cultivo_id  INTEGER NOT NULL REFERENCES cultivos_cultivo (id),
    tipo        TEXT    NOT NULL
                        CHECK (tipo IN ('compost','biol','sin_agroquimicos','riego_eficiente','mulching','control_biologico','otro')),
    fecha       TEXT    NOT NULL,               -- DateField
    descripcion TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: trazabilidad  →  modelo Costo
-- Tabla: trazabilidad_costo
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trazabilidad_costo (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cultivo_id  INTEGER NOT NULL REFERENCES cultivos_cultivo (id),
    concepto    TEXT    NOT NULL
                        CHECK (concepto IN ('insumos','agua','semillas','mano_obra','herramientas','otro')),
    monto       NUMERIC(10,2) NOT NULL,
    fecha       TEXT    NOT NULL,               -- DateField
    descripcion TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL
);

-- -------------------------------------------------------------
-- APP: pedidos  →  modelos Pedido e ItemPedido
-- Tablas: pedidos_pedido, pedidos_itempedido
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pedidos_pedido (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL REFERENCES users_user (id),
    estado      TEXT    NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','confirmado','entregado','cancelado')),
    total       NUMERIC(10,2) NOT NULL DEFAULT 0,   -- Total calculado al crear el pedido
    notas       TEXT    NOT NULL DEFAULT '',         -- Notas del comprador al productor
    created_at  TEXT    NOT NULL,                    -- DateTimeField auto_now_add
    updated_at  TEXT    NOT NULL                     -- DateTimeField auto_now
);

CREATE TABLE IF NOT EXISTS pedidos_itempedido (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id        INTEGER NOT NULL REFERENCES pedidos_pedido (id),
    cosecha_id       INTEGER NOT NULL REFERENCES cosechas_cosecha (id),
    cantidad         NUMERIC(10,2) NOT NULL,         -- Cantidad solicitada
    precio_unitario  NUMERIC(10,2) NOT NULL,         -- Precio al momento del pedido (snapshot)
    subtotal         NUMERIC(10,2) NOT NULL          -- cantidad × precio_unitario
);

-- -------------------------------------------------------------
-- ÍNDICES para mejorar rendimiento en consultas frecuentes
-- -------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_biohuerto_productor  ON biohuertos_biohuerto (productor_id);
CREATE INDEX IF NOT EXISTS idx_cultivo_biohuerto    ON cultivos_cultivo (biohuerto_id);
CREATE INDEX IF NOT EXISTS idx_monitoreo_biohuerto  ON monitoreo_monitoreoregistro (biohuerto_id);
CREATE INDEX IF NOT EXISTS idx_monitoreo_fecha      ON monitoreo_monitoreoregistro (fecha);
CREATE INDEX IF NOT EXISTS idx_alerta_cultivo       ON alertas_alerta (cultivo_id);
CREATE INDEX IF NOT EXISTS idx_alerta_fecha         ON alertas_alerta (fecha_programada);
CREATE INDEX IF NOT EXISTS idx_diagnostico_cultivo  ON diagnosticos_diagnostico (cultivo_id);
CREATE INDEX IF NOT EXISTS idx_categoria_slug       ON cosechas_categoriacosecha (slug);
CREATE INDEX IF NOT EXISTS idx_tipo_categoria       ON cosechas_tipocosecha (categoria_id);
CREATE INDEX IF NOT EXISTS idx_cosecha_categoria    ON cosechas_cosecha (categoria_id);
CREATE INDEX IF NOT EXISTS idx_cosecha_biohuerto    ON cosechas_cosecha (biohuerto_id);
CREATE INDEX IF NOT EXISTS idx_cosecha_cultivo      ON cosechas_cosecha (cultivo_id);
CREATE INDEX IF NOT EXISTS idx_practica_cultivo     ON trazabilidad_practicasostenible (cultivo_id);
CREATE INDEX IF NOT EXISTS idx_costo_cultivo        ON trazabilidad_costo (cultivo_id);
CREATE INDEX IF NOT EXISTS idx_pedido_comprador     ON pedidos_pedido (comprador_id);
CREATE INDEX IF NOT EXISTS idx_pedido_estado        ON pedidos_pedido (estado);
CREATE INDEX IF NOT EXISTS idx_itempedido_pedido    ON pedidos_itempedido (pedido_id);
CREATE INDEX IF NOT EXISTS idx_itempedido_cosecha   ON pedidos_itempedido (cosecha_id);
