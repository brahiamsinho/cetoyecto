# Arquitectura del Sistema

## Estructura del Proyecto

```
cup-ficct/
│
├── backend/                          # Laravel 10 API
│   ├── app/
│   │   ├── Console/
│   │   │   └── Kernel.php
│   │   ├── Exceptions/
│   │   │   └── Handler.php
│   │   ├── Http/
│   │   │   └── Kernel.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Role.php
│   │   │   ├── Postulante.php
│   │   │   ├── Carrera.php
│   │   │   ├── Nota.php
│   │   │   ├── Grupo.php
│   │   │   ├── Docente.php
│   │   │   ├── Materia.php
│   │   │   ├── Pago.php
│   │   │   ├── Horario.php
│   │   │   ├── Aula.php
│   │   │   ├── Gestion.php
│   │   │   ├── Examen.php
│   │   │   ├── RequisitoPostulante.php
│   │   │   ├── DocenteRequisito.php
│   │   │   ├── CargaHorariaDocente.php
│   │   │   ├── AsistenciaDocente.php
│   │   │   ├── Bitacora.php
│   │   │   ├── Importacion.php
│   │   │   └── ImportacionError.php
│   │   ├── Modules/                   # Módulos funcionales
│   │   │   ├── Auth/                  # Autenticación
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Requests/
│   │   │   │   └── Services/
│   │   │   ├── Users/                 # Usuarios y roles
│   │   │   │   ├── Controllers/
│   │   │   │   └── Requests/
│   │   │   ├── Postulantes/           # Registro de postulantes
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Requests/
│   │   │   │   └── Services/
│   │   │   ├── Requisitos/            # Requisitos documentales
│   │   │   │   └── Controllers/
│   │   │   ├── Pagos/                 # Pagos de inscripción
│   │   │   │   ├── Controllers/
│   │   │   │   └── Services/
│   │   │   ├── Notas/                 # Notas de examen
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Requests/
│   │   │   │   └── Services/
│   │   │   ├── Carreras/              # Carreras y cupos
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Requests/
│   │   │   │   └── Services/
│   │   │   ├── Grupos/                # Grupos académicos
│   │   │   │   ├── Controllers/
│   │   │   │   └── Services/
│   │   │   ├── Docentes/              # Docentes
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Requests/
│   │   │   │   └── Services/
│   │   │   ├── CargaHoraria/          # Carga horaria docente
│   │   │   │   ├── Controllers/
│   │   │   │   └── Requests/
│   │   │   ├── Aulas/                 # Aulas
│   │   │   │   └── Controllers/
│   │   │   ├── Materias/              # Materias
│   │   │   │   └── Controllers/
│   │   │   ├── Horarios/              # Horarios
│   │   │   │   └── Controllers/
│   │   │   ├── Asistencias/           # Asistencias docentes
│   │   │   │   ├── Controllers/
│   │   │   │   └── Requests/
│   │   │   ├── Dashboard/             # Panel principal
│   │   │   │   ├── Controllers/
│   │   │   │   └── Services/
│   │   │   ├── Reportes/              # Reportes
│   │   │   │   └── Controllers/
│   │   │   ├── Importaciones/         # Importación de datos
│   │   │   │   ├── Controllers/
│   │   │   │   └── Services/
│   │   │   └── Bitacora/              # Auditoría
│   │   │       └── Controllers/
│   │   └── Providers/
│   ├── bootstrap/
│   │   └── app.php
│   ├── config/                        # Configuración
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── cache.php
│   │   ├── filesystems.php
│   │   ├── mail.php
│   │   ├── sanctum.php
│   │   └── session.php
│   ├── database/
│   │   ├── migrations/                # 22 migraciones
│   │   └── seeders/                   # Seeders
│   ├── public/
│   │   └── index.php
│   ├── routes/
│   │   ├── api.php                    # Rutas de la API
│   │   ├── web.php
│   │   └── console.php
│   ├── storage/
│   ├── composer.json
│   └── artisan
│
├── frontend/                          # React + Vite
│   ├── public/
│   ├── src/
│   ├── dist/                          # Build de producción
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── docker/                            # Contenedores
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── docs/                              # Documentación
```

## Diagrama de Arquitectura

```
┌──────────────┐     HTTP/JSON      ┌──────────────┐     SQL      ┌────────────┐
│   Frontend   │ ──────────────────> │   Backend    │ ───────────> │ PostgreSQL │
│  React+Vite  │ <────────────────── │ Laravel 10   │ <─────────── │    Base    │
│  :5173       │     API REST        │ :8000        │   Eloquent   │  de Datos  │
└──────────────┘                     └──────┬───────┘              └────────────┘
                                            │
                                    ┌───────┴────────┐
                                    │   Sanctum Auth  │
                                    │   (Token API)   │
                                    └───────┬────────┘
                                            │
                                    ┌───────┴────────┐
                                    │  Modular Arch   │
                                    │  App\Modules\*  │
                                    │                 │
                                    │ Controller ──┐  │
                                    │     │        │  │
                                    │  Request    Service │
                                    │     │          │  │
                                    │     └── Model ─┘  │
                                    └──────────────────┘
```

## Principios Arquitectónicos

1. **Modular**: Cada funcionalidad es un módulo autocontenido dentro de `app/Modules/`.
2. **API RESTful**: Comunicación mediante JSON con autenticación por tokens Sanctum.
3. **Eloquent ORM**: Capa de abstracción de base de datos con relaciones definidas en los modelos.
4. **Service Layer**: La lógica de negocio reside en Services, los Controladores son delgados.
5. **Role-based Access**: Middleware `auth:sanctum` y `role.cpd` para control de acceso.
