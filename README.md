# BioHuerto USAT

Aplicación web para gestión de biohuertos urbanos comunitarios.  
Stack: Django + React + PostgreSQL + TailwindCSS + JWT

---

## Requisitos previos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

## 1. Configurar la base de datos

Abre psql o pgAdmin y ejecuta:

```sql
CREATE DATABASE biohuerto_db;
```

---

## 2. Configurar el Backend (Django)

```bash
cd biohuerto-usat/backend

# Copiar variables de entorno
copy .env.example .env
# Editar .env con tu usuario y contraseña de PostgreSQL

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario (opcional, para el panel admin)
python manage.py createsuperuser

# Cargar datos de demo
python manage.py seed

# Iniciar el servidor
python manage.py runserver
```

El backend corre en: http://localhost:8000  
Panel admin: http://localhost:8000/admin

---

## 3. Configurar el Frontend (React)

```bash
cd biohuerto-usat/frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend corre en: http://localhost:5173

---

## 4. Acceder a la aplicación

### Usuario de demo (cargado con el seed):
- **Usuario:** `productor_demo`  
- **Contraseña:** `Demo1234`

### Marketplace público (sin login):
- http://localhost:5173/marketplace

---

## Estructura del proyecto

```
biohuerto-usat/
├── backend/
│   ├── config/          ← Configuración Django (settings, urls)
│   ├── apps/
│   │   ├── users/       ← Autenticación JWT
│   │   ├── biohuertos/  ← Módulo 1
│   │   ├── cultivos/    ← Módulo 2 y 6
│   │   ├── monitoreo/   ← Módulo 3
│   │   ├── alertas/     ← Módulo 4
│   │   ├── diagnosticos/← Módulo 5
│   │   ├── cosechas/    ← Módulo 7
│   │   ├── trazabilidad/← Módulo 8
│   │   └── dashboard/   ← Módulo 9
│   ├── data/            ← JSON estáticos (recomendaciones y diagnósticos)
│   └── media/           ← Fotos subidas
└── frontend/
    └── src/
        ├── pages/       ← Una carpeta por módulo
        ├── components/  ← Layout y UI reutilizables
        ├── api/         ← Configuración axios
        └── context/     ← AuthContext (JWT)
```

---

## API principal

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Registro de productor |
| `/api/auth/login/` | POST | Login (retorna JWT) |
| `/api/biohuertos/` | GET/POST | Listar/crear biohuertos |
| `/api/cultivos/` | GET/POST | Listar/crear cultivos |
| `/api/cultivos/data/recomendaciones/` | GET | Ficha agronómica por cultivo |
| `/api/monitoreo/` | GET/POST | Registros de monitoreo |
| `/api/alertas/` | GET/POST | Alertas y recordatorios |
| `/api/alertas/{id}/completar/` | POST | Marcar alerta completada |
| `/api/diagnosticos/analizar/` | POST | Análisis fitosanitario |
| `/api/cosechas/publicas/` | GET | Vista pública (sin auth) |
| `/api/trazabilidad/practicas/` | GET/POST | Prácticas sostenibles |
| `/api/trazabilidad/costos/` | GET/POST | Costos de producción |
| `/api/trazabilidad/resumen/{cultivo_id}/` | GET | Resumen financiero |
| `/api/dashboard/` | GET | Indicadores del dashboard |
