# Endpoints de la API

**Base URL:** `http://localhost:8000/api`

---

## Auth

| Método | Endpoint                       | Descripción                    | Auth | Rol               |
|--------|--------------------------------|--------------------------------|------|-------------------|
| POST   | `/auth/login`                  | Iniciar sesión                 | No   | —                 |
| POST   | `/auth/forgot-password`        | Solicitar recuperación de clave | No  | —                 |
| POST   | `/auth/logout`                 | Cerrar sesión                  | Sí   | CPD, Jefatura, Autoridad, Docente |
| GET    | `/auth/me`                     | Obtener usuario autenticado    | Sí   | CPD, Jefatura, Autoridad, Docente |

---

## Dashboard

| Método | Endpoint                       | Descripción                    | Auth | Rol               |
|--------|--------------------------------|--------------------------------|------|-------------------|
| GET    | `/dashboard/stats`             | Estadísticas del dashboard     | Sí   | CPD, Jefatura, Autoridad, Docente |

---

## Users

| Método | Endpoint                       | Descripción                    | Auth | Rol               |
|--------|--------------------------------|--------------------------------|------|-------------------|
| GET    | `/users`                       | Listar usuarios                | Sí   | CPD               |
| POST   | `/users`                       | Crear usuario                  | Sí   | CPD               |
| GET    | `/users/{id}`                  | Ver usuario                    | Sí   | CPD               |
| PUT    | `/users/{id}`                  | Actualizar usuario             | Sí   | CPD               |
| DELETE | `/users/{id}`                  | Eliminar usuario               | Sí   | CPD               |
| GET    | `/roles`                       | Listar roles                   | Sí   | CPD               |

---

## Postulantes

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/postulantes`                         | Listar postulantes                     | Sí   | CPD, Jefatura     |
| POST   | `/postulantes`                         | Crear postulante                       | Sí   | CPD, Jefatura     |
| GET    | `/postulantes/{id}`                    | Ver postulante                         | Sí   | CPD, Jefatura     |
| PUT    | `/postulantes/{id}`                    | Actualizar postulante                  | Sí   | CPD, Jefatura     |
| DELETE | `/postulantes/{id}`                    | Eliminar postulante                    | Sí   | CPD, Jefatura     |
| PATCH  | `/postulantes/{id}/estado`             | Cambiar estado del postulante          | Sí   | CPD, Jefatura     |

---

## Requisitos

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/postulantes/{id}/requisitos`         | Listar requisitos de un postulante     | Sí   | CPD, Jefatura     |
| POST   | `/postulantes/{id}/requisitos`         | Agregar requisito                      | Sí   | CPD, Jefatura     |
| PATCH  | `/requisitos/{id}/toggle`              | Marcar requisito como cumplido/no      | Sí   | CPD, Jefatura     |

---

## Pagos

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/postulantes/{id}/pago`               | Ver pago del postulante                | Sí   | CPD, Jefatura     |
| POST   | `/postulantes/{id}/pago/simular`       | Simular pago                           | Sí   | CPD, Jefatura     |
| PATCH  | `/pagos/{id}/estado`                   | Cambiar estado del pago                | Sí   | CPD, Jefatura     |

---

## Notas

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/postulantes/{id}/notas`              | Listar notas del postulante            | Sí   | CPD, Jefatura     |
| POST   | `/postulantes/{id}/notas`              | Registrar notas                        | Sí   | CPD, Jefatura     |
| PUT    | `/notas/{id}`                          | Actualizar nota                        | Sí   | CPD, Jefatura     |
| GET    | `/postulantes/{id}/promedios`          | Obtener promedios del postulante       | Sí   | CPD, Jefatura     |

---

## Carreras

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/carreras`                            | Listar carreras                        | Sí   | CPD, Jefatura     |
| POST   | `/carreras`                            | Crear carrera                          | Sí   | CPD               |
| GET    | `/carreras/{id}`                       | Ver carrera                            | Sí   | CPD, Jefatura     |
| PUT    | `/carreras/{id}`                       | Actualizar carrera                     | Sí   | CPD               |
| DELETE | `/carreras/{id}`                       | Eliminar carrera                       | Sí   | CPD               |
| GET    | `/carreras/{id}/cupos`                 | Ver cupos de la carrera                | Sí   | CPD, Jefatura     |

---

## Cupos

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| POST   | `/cupos/asignar-carrera/{postulante}`  | Asignar carrera a postulante           | Sí   | CPD, Jefatura     |

---

## Grupos

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/grupos`                              | Listar grupos                          | Sí   | CPD, Jefatura, Autoridad, Docente |
| POST   | `/grupos/generar`                      | Generar grupos automáticamente         | Sí   | CPD, Jefatura     |
| GET    | `/grupos/{id}`                         | Ver grupo                              | Sí   | CPD, Jefatura, Autoridad, Docente |
| GET    | `/grupos/{id}/estudiantes`             | Listar estudiantes de un grupo         | Sí   | CPD, Jefatura, Docente |

---

## Docentes

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/docentes`                            | Listar docentes                        | Sí   | CPD, Jefatura     |
| POST   | `/docentes`                            | Crear docente                          | Sí   | CPD, Jefatura     |
| GET    | `/docentes/{id}`                       | Ver docente                            | Sí   | CPD, Jefatura, Docente |
| PUT    | `/docentes/{id}`                       | Actualizar docente                     | Sí   | CPD, Jefatura     |
| DELETE | `/docentes/{id}`                       | Eliminar docente                       | Sí   | CPD, Jefatura     |
| POST   | `/docentes/{id}/validar-requisitos`    | Validar requisitos del docente         | Sí   | CPD, Jefatura     |

---

## Carga Horaria

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/carga-horaria`                       | Listar carga horaria                   | Sí   | CPD, Jefatura, Docente |
| POST   | `/carga-horaria`                       | Asignar carga horaria                  | Sí   | CPD, Jefatura     |
| DELETE | `/carga-horaria/{id}`                  | Eliminar carga horaria                 | Sí   | CPD, Jefatura     |
| GET    | `/docentes/{id}/carga-horaria`         | Carga horaria por docente              | Sí   | CPD, Jefatura, Docente |

---

## Aulas

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/aulas`                               | Listar aulas                           | Sí   | CPD, Jefatura     |
| POST   | `/aulas`                               | Crear aula                             | Sí   | CPD, Jefatura     |
| GET    | `/aulas/{id}`                          | Ver aula                               | Sí   | CPD, Jefatura     |
| PUT    | `/aulas/{id}`                          | Actualizar aula                         | Sí   | CPD, Jefatura     |
| DELETE | `/aulas/{id}`                          | Eliminar aula                          | Sí   | CPD, Jefatura     |

---

## Materias

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/materias`                            | Listar materias                        | Sí   | CPD, Jefatura     |
| POST   | `/materias`                            | Crear materia                          | Sí   | CPD, Jefatura     |
| GET    | `/materias/{id}`                       | Ver materia                            | Sí   | CPD, Jefatura     |
| PUT    | `/materias/{id}`                       | Actualizar materia                     | Sí   | CPD, Jefatura     |
| DELETE | `/materias/{id}`                       | Eliminar materia                       | Sí   | CPD, Jefatura     |

---

## Horarios

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/horarios`                            | Listar horarios                        | Sí   | CPD, Jefatura     |
| POST   | `/horarios`                            | Crear horario                          | Sí   | CPD, Jefatura     |
| GET    | `/horarios/{id}`                       | Ver horario                            | Sí   | CPD, Jefatura     |
| PUT    | `/horarios/{id}`                       | Actualizar horario                     | Sí   | CPD, Jefatura     |
| DELETE | `/horarios/{id}`                       | Eliminar horario                       | Sí   | CPD, Jefatura     |

---

## Asistencias

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| POST   | `/asistencias`                         | Registrar asistencia                   | Sí   | CPD, Jefatura, Docente |
| GET    | `/asistencias`                         | Listar asistencias                     | Sí   | CPD, Jefatura     |
| GET    | `/asistencias/{grupo}`                 | Asistencias por grupo                  | Sí   | CPD, Jefatura, Docente |

---

## Reportes

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/reportes/postulantes`               | Reporte de postulantes                 | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/aprobados`                 | Postulantes aprobados                  | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/reprobados`                | Postulantes reprobados                 | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/promedios`                 | Promedios por materia                  | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/grupos`                    | Reporte de grupos                      | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/estadisticas-materia`      | Estadísticas por materia               | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/docentes-grupos`           | Docentes por grupo                     | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/grupos-mas-aprobados`      | Grupos con más aprobados               | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/asistencia-docente`        | Reporte de asistencia docente          | Sí   | CPD, Jefatura, Autoridad |
| GET    | `/reportes/cupos-carrera`             | Reporte de cupos por carrera           | Sí   | CPD, Jefatura, Autoridad |

---

## Importaciones

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| POST   | `/importaciones/usuarios`              | Importar usuarios desde archivo        | Sí   | CPD               |
| GET    | `/importaciones`                       | Listar importaciones                   | Sí   | CPD               |

---

## Bitácora

| Método | Endpoint                               | Descripción                            | Auth | Rol               |
|--------|----------------------------------------|----------------------------------------|------|-------------------|
| GET    | `/bitacora`                            | Consultar registros de bitácora        | Sí   | CPD               |
