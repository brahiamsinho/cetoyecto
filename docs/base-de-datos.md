# Base de Datos

## Motor

PostgreSQL 15+

## Nombre de la Base de Datos

`cup_ficct`

## Listado de Tablas (22 tablas)

| #  | Tabla                      | Descripción                                        |
|----|----------------------------|----------------------------------------------------|
| 1  | `roles`                    | Roles del sistema (CPD, Jefatura, Autoridad, Docente) |
| 2  | `users`                    | Usuarios del sistema                               |
| 3  | `personal_access_tokens`   | Tokens de autenticación Sanctum                    |
| 4  | `carreras`                 | Carreras ofertadas                                 |
| 5  | `gestiones`                | Gestiones académicas (año y periodo)               |
| 6  | `postulantes`              | Postulantes al proceso de admisión                 |
| 7  | `requisitos_postulantes`   | Requisitos documentales por postulante             |
| 8  | `pagos`                    | Pagos de inscripción                               |
| 9  | `materias`                 | Materias del examen de admisión                    |
| 10 | `examenes`                 | Notas de examen por postulante y materia           |
| 11 | `notas`                    | Notas por postulante y materia                     |
| 12 | `grupos`                   | Grupos académicos                                  |
| 13 | `grupo_postulante`         | Relación muchos-a-muchos entre grupos y postulantes |
| 14 | `docentes`                 | Docentes registrados                               |
| 15 | `docente_requisitos`       | Requisitos cumplidos por docentes                  |
| 16 | `aulas`                    | Aulas y laboratorios                               |
| 17 | `horarios`                 | Horarios disponibles                               |
| 18 | `carga_horaria_docente`    | Asignación de carga horaria a docentes             |
| 19 | `asistencias_docentes`     | Registro de asistencias de docentes                |
| 20 | `bitacoras`                | Auditoría de acciones del sistema                  |
| 21 | `importaciones`            | Registro de importaciones de datos                 |
| 22 | `importacion_errores`      | Errores detectados durante importaciones           |

## Diagrama Entidad-Relación (Texto)

```
┌──────────────┐
│    roles     │
├──────────────┤
│ id (PK)      │──┐
│ nombre       │  │
│ descripcion  │  │
└──────────────┘  │
                  │ 1:N
┌─────────────────┘
│
▼
┌──────────────┐        ┌──────────────────────┐
│    users     │        │ personal_access_tokens│
├──────────────┤        ├──────────────────────┤
│ id (PK)      │──┐     │ id (PK)              │
│ rol_id (FK)  │  │     │ tokenable_id         │
│ name         │  │     │ tokenable_type       │
│ email        │  │     │ token                │
│ password     │  │     │ abilities            │
│ activo       │  │     │ last_used_at         │
│ last_login_at│  │     │ expires_at           │
└──────────────┘  │     └──────────────────────┘
                  │ 1:N
┌─────────────────┘
│
▼
┌──────────────────┐
│   bitacoras      │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ action           │
│ module           │
│ description      │
│ ip_address       │
│ user_agent       │
└──────────────────┘

┌──────────────┐
│  gestiones   │
├──────────────┤
│ id (PK)      │──┐
│ anio         │  │
│ periodo      │  │
│ activa       │  │
└──────────────┘  │
                  │ 1:N
┌─────────────────┘
│
▼
┌──────────────────┐        ┌──────────────────────┐
│   postulantes    │        │    carreras           │
├──────────────────┤        ├──────────────────────┤
│ id (PK)          │──┐     │ id (PK)              │
│ ci (UQ)          │  │     │ codigo (UQ)          │
│ nombres          │  │     │ nombre (UQ)          │
│ apellidos        │  │     │ descripcion          │
│ fecha_nacimiento │  │     │ cupo_maximo          │
│ sexo             │  │     │ cupo_actual          │
│ direccion        │  │     │ activo               │
│ telefono         │  │     └──────────────────────┘
│ email (UQ)       │  │              │
│ colegio_procedencia│  │            │ 1:N
│ ciudad           │  │     ┌─────────────────┐
│ carrera_primera_id (FK)──┼─────┘               │
│ carrera_segunda_id (FK)──┼──────┐              │
│ titulo_bachiller │  │     │     │              │
│ gestion_id (FK)  │──┘     │     │              │
│ estado           │        │     │              │
│ carrera_asignada_id (FK)──┼─────┼──────────────┘
│ deleted_at (soft)│        │     │
└──────────────────┘        │     │
                            │     │
       1:1                  │     │
┌──────────────────┐        │     │
│     pagos        │        │     │
├──────────────────┤        │     │
│ id (PK)          │        │     │
│ postulante_id (FK,UQ)──┘     │     │
│ monto            │        │     │
│ codigo_transaccion│        │     │
│ estado           │        │     │
│ fecha_pago       │        │     │
│ metodo_pago      │        │     │
└──────────────────┘        │     │
                            │     │
┌──────────────────┐        │     │
│ requisitos_postulantes│   │     │
├──────────────────┤        │     │
│ id (PK)          │        │     │
│ postulante_id (FK)──┘     │     │
│ tipo_requisito   │        │     │
│ cumplido         │        │     │
│ observaciones    │        │     │
│ UQ(postulante_id,│        │     │
│    tipo_requisito)│        │     │
└──────────────────┘        │     │
                            │     │
┌──────────────────┐        │     │
│    examenes      │        │     │
├──────────────────┤        │     │
│ id (PK)          │        │     │
│ postulante_id (FK)──┘     │     │
│ materia_id (FK)  │────────┼─────┼───────┐
│ numero_examen    │        │     │       │
│ nota             │        │     │       │
│ UQ(postulante_id,│        │     │       │
│    materia_id,   │        │     │       │
│    numero_examen)│        │     │       │
└──────────────────┘        │     │       │
                            │     │       │
┌──────────────────┐        │     │       │
│     notas        │        │     │       │
├──────────────────┤        │     │       │
│ id (PK)          │        │     │       │
│ postulante_id (FK)──┘     │     │       │
│ materia_id (FK)  │────────┼─────┼───────┤
│ nota1            │        │     │       │
│ nota2            │        │     │       │
│ nota3            │        │     │       │
│ promedio         │        │     │       │
│ UQ(postulante_id,│        │     │       │
│    materia_id)   │        │     │       │
└──────────────────┘        │     │       │
                            │     │       │
┌──────────────────┐        │     │       │
│    grupos        │        │     │       │
├──────────────────┤        │     │       │
│ id (PK)          │──┐     │     │       │
│ codigo (UQ)      │  │     │     │       │
│ nombre           │  │     │     │       │
│ materia_id (FK)  │─────────────┼───────┘
│ gestion_id (FK)  │──┼──┘     │     │
└──────────────────┘  │        │     │
                      │ 1:N   │     │
┌──────────────────┐  │        │     │
│ grupo_postulante │  │        │     │
├──────────────────┤  │        │     │
│ id (PK)          │  │        │     │
│ grupo_id (FK)    │──┘        │     │
│ postulante_id (FK)───────────┘     │
│ created_at       │                 │
│ UQ(grupo_id,     │                 │
│    postulante_id)│                 │
└──────────────────┘                 │
                                     │
┌──────────────┐                     │
│   materias   │                     │
├──────────────┤                     │
│ id (PK)      │─────────────────────┘
│ codigo (UQ)  │
│ nombre (UQ)  │
│ descripcion  │
└──────┬───────┘
       │
       │ 1:N    1:N           1:N
┌──────┴─────────────────────────────────┐
│       carga_horaria_docente             │
├────────────────────────────────────────┤
│ id (PK)                                │
│ docente_id (FK) ────────┐              │
│ grupo_id (FK) ──────────┤              │
│ materia_id (FK) ────────┤              │
│ aula_id (FK) ───────────┼────────┐     │
│ horario_id (FK) ────────┼────┐   │     │
│ UQ(docente_id, horario_id)  │   │     │
│ UQ(aula_id, horario_id)     │   │     │
│ UQ(grupo_id, materia_id)    │   │     │
└─────────────────────────────┘   │     │
                                  │     │
┌──────────────┐                  │     │
│   docentes   │                  │     │
├──────────────┤                  │     │
│ id (PK)      │──────────────────┘     │
│ ci (UQ)      │                        │
│ nombres      │                        │
│ apellidos    │                        │
│ email (UQ)   │                        │
│ telefono     │                        │
│ profesion    │                        │
│ maestria     │                        │
│ diplomado_educacion_superior          │
│ contratado   │                        │
│ user_id (FK) │                        │
└──────┬───────┘                        │
       │                                │
┌──────┴──────────┐                     │
│ docente_requisitos│                   │
├─────────────────┤                     │
│ id (PK)         │                     │
│ docente_id (FK) │                     │
│ tipo_requisito  │                     │
│ cumplido        │                     │
│ archivo         │                     │
└─────────────────┘                     │
                                        │
┌──────────────┐                        │
│    aulas     │                        │
├──────────────┤                        │
│ id (PK)      │────────────────────────┘
│ codigo (UQ)  │
│ nombre       │
│ capacidad    │
│ ubicacion    │
└──────────────┘
                   
┌──────────────┐
│   horarios   │
├──────────────┤
│ id (PK)      │────────────────────────┐
│ dia          │                        │
│ hora_inicio  │                        │
│ hora_fin     │                        │
│ turno        │                        │
│ UQ(dia,      │                        │
│   hora_inicio,│                       │
│   hora_fin)  │                        │
└──────────────┘                        │
                                        │
┌───────────────────────────────────────┘
│
▼
┌──────────────────────┐
│ asistencias_docentes  │
├──────────────────────┤
│ id (PK)              │
│ docente_id (FK)      │
│ grupo_id (FK)        │
│ materia_id (FK)      │
│ horario_id (FK)      │
│ fecha                │
│ estado               │
│ observaciones        │
│ UQ(docente_id,       │
│    grupo_id,         │
│    materia_id,       │
│    fecha)            │
└──────────────────────┘

┌──────────────────┐
│  importaciones   │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ tipo             │
│ archivo          │
│ total_filas      │
│ filas_exitosas   │
│ filas_error      │
│ estado           │
└────────┬─────────┘
         │ 1:N
┌────────┴──────────┐
│ importacion_errores│
├───────────────────┤
│ id (PK)           │
│ importacion_id (FK)│
│ fila              │
│ campo             │
│ error             │
└───────────────────┘
```

## Relaciones Clave

| Relación                            | Tipo  | Descripción                                |
|-------------------------------------|-------|--------------------------------------------|
| roles 1:N users                     | 1:N   | Un rol tiene muchos usuarios               |
| users 1:N bitacoras                 | 1:N   | Un usuario tiene muchas entradas de bitácora |
| gestiones 1:N postulantes           | 1:N   | Una gestión tiene muchos postulantes        |
| carreras 1:N postulantes            | 1:N   | Una carrera tiene muchos postulantes        |
| postulantes 1:1 pagos               | 1:1   | Un postulante tiene un pago                 |
| postulantes 1:N requisitos_postulantes | 1:N | Un postulante tiene muchos requisitos       |
| postulantes 1:N notas               | 1:N   | Un postulante tiene notas en varias materias |
| postulantes 1:N examenes            | 1:N   | Un postulante tiene varios exámenes         |
| postulantes N:M grupos              | N:M   | Tabla pivote `grupo_postulante`             |
| grupos 1:N grupo_postulante         | 1:N   | Un grupo tiene muchos postulantes           |
| materias 1:N grupos                 | 1:N   | Una materia tiene muchos grupos             |
| materias 1:N notas                  | 1:N   | Una materia tiene muchas notas              |
| docentes 1:N carga_horaria_docente  | 1:N   | Un docente tiene múltiples cargas horarias  |
| aulas 1:N carga_horaria_docente     | 1:N   | Un aula aparece en múltiples cargas         |
| horarios 1:N carga_horaria_docente  | 1:N   | Un horario aparece en múltiples cargas      |
| importaciones 1:N importacion_errores | 1:N | Una importación tiene muchos errores        |
