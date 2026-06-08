# KIARA — Plataforma de gestión de biohuertos (USAT 2026)

Aplicación web para que productores agrícolas gestionen sus biohuertos: cultivos, campañas productivas, plan fitosanitario, riego, presupuesto y trazabilidad agroecológica.

---

## Stack tecnológico

| Capa       | Tecnología                                              |
|------------|---------------------------------------------------------|
| Backend    | Python 3 · Django 4.2+ · Django REST Framework · SQLite (dev) / PostgreSQL (prod) |
| Auth       | JWT via `djangorestframework-simplejwt`                 |
| Frontend   | React 18 · Vite · React Router v6 · Tailwind CSS 3     |
| UI         | lucide-react · react-hot-toast                          |
| PDF export | jsPDF + jspdf-autotable · `window.print()` (trazabilidad) |
| Pagos      | MercadoPago SDK (sandbox configurado)                   |

---

## Cómo levantar el proyecto

### Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # opcional
python manage.py runserver         # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> El backend debe estar corriendo antes de abrir el frontend.  
> CORS ya está configurado para `http://localhost:5173`.

---

## Estructura del proyecto

```
biohuerto-usat/
├── backend/
│   ├── config/
│   │   ├── settings.py          # Configuración Django (DB, JWT, CORS, MercadoPago)
│   │   ├── urls.py              # Enrutador principal de la API
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/               # Auth: registro, login, perfil, roles
│   │   ├── biohuertos/          # Biohuertos + Documentos adjuntos (PDF/img)
│   │   ├── cultivos/            # Cultivos por biohuerto (anual / perenne)
│   │   ├── campanas/            # ★ Módulo principal de campañas productivas
│   │   │   ├── models.py        #   Variedad, ProductoAgricola, TipoLabor, Campana,
│   │   │   │                    #   LaborCampana, ItemFitosanitario, RegistroAplicacion,
│   │   │   │                    #   PlanRiego, RegistroRiego, PresupuestoItem, PracticaSostenible
│   │   │   ├── serializers.py
│   │   │   ├── views.py         #   CampanaMixin + vistas anidadas por campaña
│   │   │   └── urls.py
│   │   ├── monitoreo/           # Registros de clima/ambiente
│   │   ├── alertas/             # Alertas y recordatorios
│   │   ├── diagnosticos/        # Diagnóstico fitosanitario
│   │   ├── cosechas/            # Registros de cosecha
│   │   ├── trazabilidad/        # Trazabilidad (módulo legado, separado del de campañas)
│   │   ├── pedidos/             # Pedidos del marketplace (MercadoPago)
│   │   └── dashboard/           # Datos agregados para el dashboard
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js             # Cliente Axios con baseURL y JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx      # Token JWT, user, login/logout
        │   ├── ThemeContext.jsx     # dark / light mode
        │   └── CartContext.jsx      # Carrito del marketplace
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx      # Navegación lateral (módulos en grid 2 col)
        │   │   ├── Layout.jsx       # Wrapper de páginas protegidas
        │   │   ├── Header.jsx       # Navbar pública
        │   │   ├── Footer.jsx
        │   │   └── PublicLayout.jsx
        │   ├── ui/
        │   │   ├── EmptyState.jsx
        │   │   └── Loading.jsx
        │   ├── icons/               # Iconos SVG personalizados
        │   └── cart/
        │       └── CartDrawer.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── MarketplacePage.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── MisComprasPage.jsx
            ├── administrativo/
            │   ├── AdministrativoPage.jsx   # Panel admin: ver biohuertos de productores
            │   └── AsignarRolesPage.jsx
            ├── usuarios/
            │   └── UsuariosPage.jsx
            ├── biohuertos/
            │   ├── BiohuertosPage.jsx       # CRUD + subida de documentos PDF
            │   ├── BiohuertosForm.jsx
            │   └── BiohuertosDetail.jsx
            ├── cultivos/
            │   ├── CultivosPage.jsx         # CRUD con tipo_ciclo anual/perenne
            │   ├── CultivosForm.jsx
            │   └── CultivosDetail.jsx
            ├── campanas/
            │   ├── CampanasPage.jsx         # Grid de campañas con filtros + modal CRUD
            │   └── CampanaDetailPage.jsx    # Detalle con 5 tabs (ver abajo)
            ├── catalogos/
            │   └── CatalogosPage.jsx        # 3 tabs: Variedades · Productos · Tipos labor
            ├── monitoreo/
            │   └── MonitoreoPage.jsx
            ├── alertas/
            │   └── AlertasPage.jsx
            ├── diagnostico/
            │   └── DiagnosticoPage.jsx
            ├── cosechas/
            │   ├── CosechasPage.jsx
            │   └── CosechasForm.jsx
            ├── trazabilidad/
            │   └── TrazabilidadPage.jsx
            ├── recomendaciones/
            │   └── RecomendacionesPage.jsx
            └── checkout/
                ├── CheckoutPage.jsx
                ├── PagoExitosoPage.jsx
                ├── PagoPendientePage.jsx
                └── PagoFallidoPage.jsx
```

---

## Rutas de la API

### Auth · `/api/auth/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register/` | Registro |
| POST | `/api/auth/login/` | Login → devuelve access + refresh |
| POST | `/api/auth/refresh/` | Renovar token |
| GET/PATCH | `/api/auth/me/` | Perfil del usuario autenticado |

### Biohuertos · `/api/biohuertos/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/biohuertos/` | Listar / crear biohuertos |
| GET/PATCH/DELETE | `/api/biohuertos/{id}/` | Detalle |
| GET/POST | `/api/biohuertos/{id}/documentos/` | Documentos adjuntos (multipart) |
| DELETE | `/api/biohuertos/documentos/{id}/` | Eliminar documento |

### Cultivos · `/api/cultivos/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/cultivos/` | Listar / crear cultivos |
| GET/PATCH/DELETE | `/api/cultivos/{id}/` | Detalle |

### Campañas · `/api/campanas/`

#### Catálogos compartidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/campanas/variedades/` | Variedades (cultivo + nombre + subtipo + ciclo) |
| GET/PATCH/DELETE | `/api/campanas/variedades/{id}/` | |
| GET/POST | `/api/campanas/productos/` | Productos agrícolas (fitosanitario, fertilizante…) |
| GET/PATCH/DELETE | `/api/campanas/productos/{id}/` | |
| GET/POST | `/api/campanas/tipos-labor/` | Tipos de labor (código, costo default, unidad) |
| GET/PATCH/DELETE | `/api/campanas/tipos-labor/{id}/` | |

#### Campañas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/campanas/` | Listar / crear campañas del productor |
| GET/PATCH/DELETE | `/api/campanas/{id}/` | Detalle |

#### Sub-módulos anidados (todos requieren JWT del dueño)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/campanas/{id}/labores/` | Plan de labores |
| PATCH/DELETE | `/api/campanas/labores/{id}/` | Editar / eliminar labor |
| GET/POST | `/api/campanas/{id}/fitosanitario/` | Plan fitosanitario |
| PATCH/DELETE | `/api/campanas/fitosanitario/{id}/` | |
| GET/POST | `/api/campanas/{id}/aplicaciones/` | Registros de aplicación |
| DELETE | `/api/campanas/aplicaciones/{id}/` | |
| GET/POST | `/api/campanas/{id}/plan-riego/` | Planes de riego / fertirrigación |
| PATCH/DELETE | `/api/campanas/plan-riego/{id}/` | |
| GET/POST | `/api/campanas/{id}/registros-riego/` | Riegos ejecutados |
| DELETE | `/api/campanas/registros-riego/{id}/` | |
| GET/POST | `/api/campanas/{id}/presupuesto/` | Ítems de presupuesto |
| PATCH/DELETE | `/api/campanas/presupuesto/{id}/` | |
| GET/POST | `/api/campanas/{id}/practicas/` | Prácticas sostenibles |
| DELETE | `/api/campanas/practicas/{id}/` | |

---

## Módulo Campañas — detalle funcional

### CampanasPage (`/campanas`)
- Grid de cards responsivo (1→2→3 cols)
- Filtros: estado + biohuerto
- Badge de labores pendientes
- Código auto-generado en backend: `CA-{biohuerto.codigo}-{año}-{N}`
- Modal CRUD: biohuerto, variedad, año, fechas, área, estado, objetivo cosecha, precio venta

### CampanaDetailPage (`/campanas/:id`) — 5 tabs

| Tab | Funcionalidad |
|-----|---------------|
| **Labores** | Plan de labores · toggle ejecutada/pendiente · costos programado vs ejecutado |
| **Fitosanitario** | Plan de productos (dosis, intervalo seguridad, condición) · registros de aplicación · alerta visual de días antes cosecha |
| **Riego & Fertirrigación** | Planes con método/frecuencia/litros · fertirrigación opcional por plan · registros de riego ejecutados con costo de agua |
| **Presupuesto** | KPIs: presupuestado / ejecutado / ahorro-exceso / rentabilidad estimada · tabla por categoría (insumo, agua, mano de obra) · varianza por ítem |
| **Trazabilidad** | Prácticas sostenibles (compost, sin agroquímicos, riego eficiente…) · línea de tiempo unificada de todas las actividades · **exportar PDF** via `window.print()` |

### CatalogosPage (`/catalogos`) — 3 tabs
- **Variedades**: cultivo macro + nombre + subtipo + tipo ciclo + días ciclo
- **Productos agrícolas**: nombre + tipo + unidad + precio unitario
- **Tipos de labor**: código + nombre + tipo + unidad default + costo default

---

## Modelos clave

### Campana
```
biohuerto → Biohuerto (FK)
variedad  → Variedad (FK)
codigo    = "CA-{biohuerto.codigo}-{año}-{N:02d}"  ← auto-generado
anio, fecha_inicio, fecha_fin
area, unidad_area
estado: planificada | activa | cerrada | cancelada
objetivo_cosecha, unidad_cosecha, precio_venta_estimado
```

### PresupuestoItem
```
monto_presupuestado  = @property → cantidad × precio_unitario
varianza             = @property → monto_presupuestado − monto_ejecutado
```

### RegistroAplicacion
```
costo_total = dosis_aplicada × area_aplicada × producto.precio_unitario
              ← calculado automáticamente en perform_create
```

### LaborCampana
```
costo_unitario  ← hereda de TipoLabor.costo_unitario_default al crear
costo_programado = cantidad_programada × costo_unitario  (SerializerMethodField)
costo_ejecutado  = cantidad_ejecutada  × costo_unitario  (SerializerMethodField)
```

---

## Convenciones de código

- **Permisos**: todas las vistas de campañas filtran por `biohuerto__productor=request.user`
- **Mixin pattern**: `CampanaMixin._campana()` → `get_object_or_404(Campana, pk=campana_pk, biohuerto__productor=user)`
- **Estilos frontend**: inline styles con paleta `D = { cardBg, inputBg, text, sub… }` + Tailwind para layout
- **Scrollbar**: clase `.thin-scroll` (4px, definida en `index.css`)
- **Dark/light**: el sidebar siempre usa fondo oscuro (verde en light, azul marino en dark); las páginas respetan `useTheme().dark`
- **Toast**: `react-hot-toast` para confirmaciones y errores

---

## Variables de entorno (backend `.env`)

```env
SECRET_KEY=django-insecure-cambiar-en-prod
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos (dejar vacío para SQLite)
USE_POSTGRES=False
DB_NAME=biohuerto_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx
MERCADOPAGO_SANDBOX=True

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

---

## Dependencias backend (`requirements.txt`)

```
Django>=4.2,<6.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
django-cors-headers>=4.3.0
Pillow>=10.4.0
python-decouple>=3.8
psycopg2-binary>=2.9.9
mercadopago>=2.2.0
google-auth>=2.0.0
requests>=2.31.0
```

## Dependencias frontend (`package.json`)

```
react 18, react-dom, react-router-dom 6
axios, react-hot-toast
lucide-react
jspdf, jspdf-autotable
@react-oauth/google
tailwindcss 3, vite 5
```
