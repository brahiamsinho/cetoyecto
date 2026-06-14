# Roles y Permisos

## Roles del Sistema

| Rol                  | Descripción                                          |
|----------------------|------------------------------------------------------|
| CPD                  | Comité de Programación Docente — Acceso total        |
| Jefatura de Carrera  | Jefe/a de carrera — Gestión académica                |
| Autoridad/Decanato   | Autoridades del Decanato — Acceso de solo lectura    |
| Docente              | Docente universitario — Acceso limitado a lo propio  |

## Matriz de Permisos

| Módulo              | CPD              | Jefatura         | Autoridad       | Docente                 |
|---------------------|------------------|------------------|-----------------|-------------------------|
| Auth                | Login            | Login            | Login           | Login                   |
| Dashboard           | Ver estadísticas | Ver estadísticas | Ver estadísticas | Ver estadísticas        |
| Usuarios            | CRUD             | —                | —               | —                       |
| Roles               | Ver              | —                | —               | —                       |
| Postulantes         | CRUD             | CRUD             | Leer            | —                       |
| Requisitos          | CRUD             | CRUD             | Leer            | —                       |
| Pagos               | CRUD             | CRUD             | Leer            | —                       |
| Notas               | CRUD             | CRUD             | Leer            | —                       |
| Carreras            | CRUD             | Leer             | Leer            | —                       |
| Cupos               | Administrar      | Administrar      | Leer            | —                       |
| Grupos              | CRUD             | Administrar      | Leer            | Ver propios             |
| Docentes            | CRUD             | CRUD             | Leer            | Ver propio              |
| Carga Horaria       | CRUD             | CRUD             | Leer            | Ver propia              |
| Aulas               | CRUD             | CRUD             | Leer            | —                       |
| Materias            | CRUD             | CRUD             | Leer            | —                       |
| Horarios            | CRUD             | CRUD             | Leer            | —                       |
| Asistencias         | CRUD             | CRUD             | Leer            | Registrar propia        |
| Reportes            | Todos            | Todos            | Todos           | —                       |
| Importaciones       | CRUD             | —                | —               | —                       |
| Bitácora            | Leer             | —                | —               | —                       |

## Leyenda

| Término       | Significado                              |
|---------------|------------------------------------------|
| CRUD          | Crear, Leer, Actualizar, Eliminar        |
| Leer          | Solo consulta / vista                    |
| Administrar   | Acciones específicas del módulo          |
| Ver propio    | Solo datos asociados al usuario actual   |
| —             | Sin acceso                               |
