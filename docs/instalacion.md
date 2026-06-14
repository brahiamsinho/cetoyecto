# Guía de Instalación

## Requisitos

| Herramienta  | Versión Mínima |
|--------------|----------------|
| PHP          | 8.1+           |
| Composer     | 2.x            |
| Node.js      | 18+            |
| npm          | 9+             |
| PostgreSQL   | 15+            |

## Clonar el Repositorio

```bash
git clone <url-del-repositorio> cup-ficct
cd cup-ficct
```

---

## Configuración del Backend (Laravel 10)

```bash
cd backend
```

### 1. Instalar dependencias de PHP

```bash
composer install
```

### 2. Configurar variables de entorno

```bash
copy .env.example .env
```

Editar el archivo `.env` y configurar la conexión a PostgreSQL:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=cup_ficct
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
```

### 3. Crear la base de datos

Conéctate a PostgreSQL y ejecuta:

```sql
CREATE DATABASE cup_ficct;
```

O desde la terminal:

```bash
psql -U postgres -c "CREATE DATABASE cup_ficct;"
```

### 4. Generar clave de aplicación

```bash
php artisan key:generate
```

### 5. Ejecutar migraciones y seeders

```bash
php artisan migrate --seed
```

Esto creará todas las tablas y poblará la base de datos con datos iniciales (roles, carreras, materias, aulas, horarios, gestión, y usuario administrador).

### 6. Crear enlace de almacenamiento

```bash
php artisan storage:link
```

### 7. Iniciar servidor de desarrollo

```bash
php artisan serve
```

El backend estará disponible en: `http://localhost:8000`

---

## Configuración del Frontend (React + Vite)

```bash
cd frontend
```

### 1. Instalar dependencias de Node

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## Acceso

| Componente | URL                    |
|------------|------------------------|
| Backend    | http://localhost:8000  |
| Frontend   | http://localhost:5173  |

## Usuario por Defecto

| Email                 | Contraseña | Rol  |
|-----------------------|------------|------|
| admin@ficct.edu.bo    | password   | CPD  |

Ver [Usuario de Prueba](usuario-prueba.md) para más detalles.
