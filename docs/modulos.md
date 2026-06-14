# Módulos del Sistema

El sistema se compone de 18 módulos que cubren todo el ciclo de admisión, desde el registro de postulantes hasta la generación de reportes y la gestión docente.

---

### 1. Auth — Autenticación

| Campo       | Valor                                |
|-------------|--------------------------------------|
| Descripción | Inicio de sesión, cierre de sesión, recuperación de contraseña y obtención del usuario autenticado. |
| Controller  | `App\Modules\Auth\Controllers\AuthController` |
| Services    | `App\Modules\Auth\Services\AuthService` |

**Rutas clave:**
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/logout` — Cerrar sesión
- `GET /api/auth/me` — Obtener usuario actual
- `POST /api/auth/forgot-password` — Recuperar contraseña

---

### 2. Dashboard — Panel Principal

| Campo       | Valor                                    |
|-------------|------------------------------------------|
| Descripción | Estadísticas generales del sistema para el panel de inicio. |
| Controller  | `App\Modules\Dashboard\Controllers\DashboardController` |
| Services    | `App\Modules\Dashboard\Services\DashboardService` |

**Rutas clave:**
- `GET /api/dashboard/stats` — Estadísticas del dashboard

---

### 3. Users — Usuarios

| Campo       | Valor                                |
|-------------|--------------------------------------|
| Descripción | CRUD de usuarios del sistema. Solo accesible para rol CPD. |
| Controller  | `App\Modules\Users\Controllers\UserController` |

**Rutas clave:**
- `GET /api/users` — Listar usuarios
- `POST /api/users` — Crear usuario
- `GET /api/users/{id}` — Ver usuario
- `PUT /api/users/{id}` — Actualizar usuario
- `DELETE /api/users/{id}` — Eliminar usuario

---

### 4. Roles

| Campo       | Valor                                |
|-------------|--------------------------------------|
| Descripción | Listado de roles disponibles en el sistema. |
| Controller  | `App\Modules\Users\Controllers\RoleController` |

**Rutas clave:**
- `GET /api/roles` — Listar roles

---

### 5. Postulantes — Postulantes

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Descripción | Gestión completa de postulantes: registro, consulta, actualización, cambio de estado y eliminación. |
| Controller  | `App\Modules\Postulantes\Controllers\PostulanteController` |
| Services    | `App\Modules\Postulantes\Services\PostulanteService` |

**Rutas clave:**
- `GET /api/postulantes` — Listar postulantes
- `POST /api/postulantes` — Crear postulante
- `GET /api/postulantes/{id}` — Ver postulante
- `PUT /api/postulantes/{id}` — Actualizar postulante
- `DELETE /api/postulantes/{id}` — Eliminar postulante
- `PATCH /api/postulantes/{id}/estado` — Cambiar estado del postulante

---

### 6. Requisitos — Requisitos de Postulantes

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Descripción | Gestión de requisitos documentales de cada postulante. |
| Controller  | `App\Modules\Requisitos\Controllers\RequisitoController` |

**Rutas clave:**
- `GET /api/postulantes/{id}/requisitos` — Listar requisitos de un postulante
- `POST /api/postulantes/{id}/requisitos` — Agregar requisito
- `PATCH /api/requisitos/{id}/toggle` — Marcar requisito como cumplido/no cumplido

---

### 7. Pagos — Pagos

| Campo       | Valor                                  |
|-------------|----------------------------------------|
| Descripción | Gestión de pagos de inscripción de postulantes. |
| Controller  | `App\Modules\Pagos\Controllers\PagoController` |
| Services    | `App\Modules\Pagos\Services\PagoService` |

**Rutas clave:**
- `GET /api/postulantes/{id}/pago` — Ver pago del postulante
- `POST /api/postulantes/{id}/pago/simular` — Simular pago
- `PATCH /api/pagos/{id}/estado` — Cambiar estado del pago

---

### 8. Notas — Notas

| Campo       | Valor                                    |
|-------------|------------------------------------------|
| Descripción | Registro y gestión de notas de examen de admisión por postulante y materia. |
| Controller  | `App\Modules\Notas\Controllers\NotaController` |
| Services    | `App\Modules\Notas\Services\NotaService` |

**Rutas clave:**
- `GET /api/postulantes/{id}/notas` — Listar notas del postulante
- `POST /api/postulantes/{id}/notas` — Registrar notas
- `PUT /api/notas/{id}` — Actualizar nota
- `GET /api/postulantes/{id}/promedios` — Obtener promedios del postulante

---

### 9. Carreras — Carreras

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| Descripción | CRUD de carreras ofertadas y gestión de cupos. |
| Controller  | `App\Modules\Carreras\Controllers\CarreraController` |
| Services    | `App\Modules\Carreras\Services\CupoService` |

**Rutas clave:**
- `GET /api/carreras` — Listar carreras
- `POST /api/carreras` — Crear carrera
- `GET /api/carreras/{id}` — Ver carrera
- `PUT /api/carreras/{id}` — Actualizar carrera
- `DELETE /api/carreras/{id}` — Eliminar carrera
- `GET /api/carreras/{id}/cupos` — Ver cupos de la carrera
- `POST /api/cupos/asignar-carrera/{postulante}` — Asignar carrera a postulante

---

### 10. Grupos — Grupos

| Campo       | Valor                                  |
|-------------|----------------------------------------|
| Descripción | Creación y gestión de grupos académicos, asignación de estudiantes. |
| Controller  | `App\Modules\Grupos\Controllers\GrupoController` |
| Services    | `App\Modules\Grupos\Services\GrupoService` |

**Rutas clave:**
- `GET /api/grupos` — Listar grupos
- `POST /api/grupos/generar` — Generar grupos automáticamente
- `GET /api/grupos/{id}` — Ver grupo
- `GET /api/grupos/{id}/estudiantes` — Listar estudiantes de un grupo

---

### 11. Docentes — Docentes

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| Descripción | CRUD de docentes, validación de requisitos y perfiles. |
| Controller  | `App\Modules\Docentes\Controllers\DocenteController` |
| Services    | `App\Modules\Docentes\Services\DocenteService` |

**Rutas clave:**
- `GET /api/docentes` — Listar docentes
- `POST /api/docentes` — Crear docente
- `GET /api/docentes/{id}` — Ver docente
- `PUT /api/docentes/{id}` — Actualizar docente
- `DELETE /api/docentes/{id}` — Eliminar docente
- `POST /api/docentes/{id}/validar-requisitos` — Validar requisitos del docente

---

### 12. Carga Horaria — Carga Horaria Docente

| Campo       | Valor                                            |
|-------------|--------------------------------------------------|
| Descripción | Asignación de carga horaria a docentes (materia, grupo, aula, horario). |
| Controller  | `App\Modules\CargaHoraria\Controllers\CargaHorariaController` |

**Rutas clave:**
- `GET /api/carga-horaria` — Listar carga horaria
- `POST /api/carga-horaria` — Asignar carga horaria
- `DELETE /api/carga-horaria/{id}` — Eliminar carga horaria
- `GET /api/docentes/{id}/carga-horaria` — Carga horaria por docente

---

### 13. Aulas — Aulas

| Campo       | Valor                                |
|-------------|--------------------------------------|
| Descripción | CRUD de aulas y laboratorios disponibles. |
| Controller  | `App\Modules\Aulas\Controllers\AulaController` |

**Rutas clave:**
- `GET /api/aulas` — Listar aulas
- `POST /api/aulas` — Crear aula
- `GET /api/aulas/{id}` — Ver aula
- `PUT /api/aulas/{id}` — Actualizar aula
- `DELETE /api/aulas/{id}` — Eliminar aula

---

### 14. Materias — Materias

| Campo       | Valor                                    |
|-------------|------------------------------------------|
| Descripción | CRUD de materias del examen de admisión. |
| Controller  | `App\Modules\Materias\Controllers\MateriaController` |

**Rutas clave:**
- `GET /api/materias` — Listar materias
- `POST /api/materias` — Crear materia
- `GET /api/materias/{id}` — Ver materia
- `PUT /api/materias/{id}` — Actualizar materia
- `DELETE /api/materias/{id}` — Eliminar materia

---

### 15. Horarios — Horarios

| Campo       | Valor                                    |
|-------------|------------------------------------------|
| Descripción | CRUD de horarios disponibles (día, hora, turno). |
| Controller  | `App\Modules\Horarios\Controllers\HorarioController` |

**Rutas clave:**
- `GET /api/horarios` — Listar horarios
- `POST /api/horarios` — Crear horario
- `GET /api/horarios/{id}` — Ver horario
- `PUT /api/horarios/{id}` — Actualizar horario
- `DELETE /api/horarios/{id}` — Eliminar horario

---

### 16. Asistencias — Asistencias Docentes

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Descripción | Registro y consulta de asistencias de docentes por grupo, materia y fecha. |
| Controller  | `App\Modules\Asistencias\Controllers\AsistenciaController` |

**Rutas clave:**
- `POST /api/asistencias` — Registrar asistencia
- `GET /api/asistencias` — Listar asistencias
- `GET /api/asistencias/{grupo}` — Asistencias por grupo

---

### 17. Reportes — Reportes

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| Descripción | Generación de reportes: postulantes, aprobados, reprobados, promedios, grupos, estadísticas, asistencia y cupos. |
| Controller  | `App\Modules\Reportes\Controllers\ReporteController` |

**Rutas clave:**
- `GET /api/reportes/postulantes` — Reporte de postulantes
- `GET /api/reportes/aprobados` — Postulantes aprobados
- `GET /api/reportes/reprobados` — Postulantes reprobados
- `GET /api/reportes/promedios` — Promedios por materia
- `GET /api/reportes/grupos` — Reporte de grupos
- `GET /api/reportes/estadisticas-materia` — Estadísticas por materia
- `GET /api/reportes/docentes-grupos` — Docentes por grupo
- `GET /api/reportes/grupos-mas-aprobados` — Grupos con más aprobados
- `GET /api/reportes/asistencia-docente` — Reporte de asistencia docente
- `GET /api/reportes/cupos-carrera` — Reporte de cupos por carrera

---

### 18. Importaciones — Importaciones

| Campo       | Valor                                            |
|-------------|--------------------------------------------------|
| Descripción | Importación masiva de datos desde archivos. Solo accesible para rol CPD. |
| Controller  | `App\Modules\Importaciones\Controllers\ImportacionController` |
| Services    | `App\Modules\Importaciones\Services\ImportacionService` |

**Rutas clave:**
- `POST /api/importaciones/usuarios` — Importar usuarios desde archivo
- `GET /api/importaciones` — Listar importaciones realizadas

---

### 19. Bitácora — Bitácora

| Campo       | Valor                                |
|-------------|--------------------------------------|
| Descripción | Registro de auditoría de todas las acciones realizadas en el sistema. Solo accesible para rol CPD. |
| Controller  | `App\Modules\Bitacora\Controllers\BitacoraController` |

**Rutas clave:**
- `GET /api/bitacora` — Consultar registros de la bitácora
