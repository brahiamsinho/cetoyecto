# Usuario de Prueba

El sistema incluye un usuario administrador creado por defecto mediante los seeders.

## Credenciales

| Campo       | Valor                |
|-------------|----------------------|
| **Email**   | admin@ficct.edu.bo   |
| **Contraseña** | password          |
| **Rol**     | CPD                  |
| **Nombre**  | Administrador CPD    |

Este usuario tiene acceso completo a todos los módulos del sistema.

## Roles Disponibles

| Rol                  | Descripción                                          |
|----------------------|------------------------------------------------------|
| CPD                  | Comité de Programación Docente — Acceso total        |
| Jefatura de Carrera  | Jefe/a de carrera — Gestión académica                |
| Autoridad/Decanato   | Autoridades del Decanato — Acceso de solo lectura    |
| Docente              | Docente universitario — Acceso limitado a lo propio  |

Puedes crear usuarios adicionales con diferentes roles desde el módulo de **Usuarios** (solo accesible para rol CPD) o directamente en la base de datos.
