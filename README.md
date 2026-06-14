# Sistema de Admisión Universitaria CUP — FICCT

**CUP-FICCT** es una aplicación web para la gestión del proceso de admisión universitaria de la **Universidad Autónoma Gabriel René Moreno**, específicamente para la **Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones**. Administra postulantes, exámenes, calificaciones, grupos, docentes, asistencia, reportes y el control de cupos disponibles.

---

## Tecnologías

| Capa       | Tecnologías                                              |
|------------|----------------------------------------------------------|
| Backend    | Laravel 10, PHP 8.1+, PostgreSQL, Laravel Sanctum        |
| Frontend   | React 19, Vite, TailwindCSS 4, Recharts                  |
| Herramientas | Axios, React Router, Docker                            |

---

## Requisitos

- PHP 8.1 o superior
- Composer
- Node.js 18 o superior
- PostgreSQL 15 o superior
- npm

---

## Estructura del Proyecto

```
cup-ficct/
├── backend/              # Laravel API
│   ├── app/Modules/      # 18 módulos funcionales
│   ├── app/Models/       # Eloquent models
│   ├── database/         # Migrations, seeders, factories
│   └── routes/api.php    # API routes
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # Componentes reutilizables
│       ├── pages/        # 22 páginas
│       └── context/      # Auth context
├── docker/               # Despliegue con Docker
├── docs/                 # Documentación
└── scripts/              # Scripts utilitarios
```

---

## Instalación — Backend

```bash
cd backend
composer install
cp .env.example .env
# Configurar .env con conexión a PostgreSQL
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

## Instalación — Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Variables de Entorno

El archivo `.env` debe contener la configuración de conexión a la base de datos PostgreSQL y las credenciales de la aplicación:

| Variable            | Descripción                            |
|---------------------|----------------------------------------|
| `DB_CONNECTION`     | Motor de base de datos (`pgsql`)       |
| `DB_HOST`           | Host de PostgreSQL                     |
| `DB_PORT`           | Puerto de PostgreSQL (`5432`)          |
| `DB_DATABASE`       | Nombre de la base de datos             |
| `DB_USERNAME`       | Usuario de PostgreSQL                  |
| `DB_PASSWORD`       | Contraseña de PostgreSQL               |
| `SANCTUM_STATEFUL_DOMAINS` | Dominios permitidos para autenticación con Sanctum |

Revisa `backend/.env.example` para la plantilla completa.

---

## Migraciones y Seeders

```bash
php artisan migrate --seed
```

Este comando crea **22 tablas** en la base de datos y las puebla con datos de semilla para comenzar a trabajar.

---

## Usuario Administrador

| Campo    | Valor                  |
|----------|------------------------|
| Email    | admin@ficct.edu.bo     |
| Contraseña | password             |

---

## Módulos Implementados

1. Autenticación y gestión de usuarios
2. Registro de postulantes
3. Requisitos y pagos
4. Exámenes y notas
5. Carreras y control de cupos
6. Asignación de grupos
7. Docentes y carga horaria
8. Aulas, horarios y materias
9. Asistencia docente
10. Dashboard administrativo
11. Reportes
12. Importación de usuarios
13. Bitácora de actividades

---

## Módulos

- ✅ Autenticación y Usuarios
- ✅ Registro de Postulantes
- ✅ Requisitos y Pagos
- ✅ Exámenes y Notas
- ✅ Carreras y Control de Cupos
- ✅ Asignación de Grupos
- ✅ Docentes y Carga Horaria
- ✅ Aulas, Horarios y Materias
- ✅ Asistencia Docente
- ✅ Dashboard Administrativo
- ✅ Reportes
- ✅ Importación de Usuarios
- ✅ Bitácora

---

## Comandos para Ejecutar

```bash
# Terminal 1 — Backend
cd backend && php artisan serve

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Repositorio

[URL del repositorio aquí]

---

## Código QR

Genera un código QR apuntando al repositorio desde:

```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=URL_DEL_REPO
```

Reemplaza `URL_DEL_REPO` con la URL real del repositorio.

---

## Licencia

**MIT** — Consulta el archivo `LICENSE` para más detalles.
