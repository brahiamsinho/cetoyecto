<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Bitacora;
use App\Traits\HasBitacora;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que registra automáticamente en la bitácora todas las acciones
 * que modifican datos (POST, PUT, PATCH, DELETE).
 *
 * Si un controlador ya llama explícitamente a logBitacora(), este middleware
 * evita duplicados comprobando si ya existe un registro idéntico en los últimos 5 segundos.
 *
 * Zona horaria: America/La_Paz (Bolivia)
 */
class LogBitacora
{
    use HasBitacora;

    /**
     * Mapeo de métodos HTTP a acciones.
     */
    private const ACTION_MAP = [
        'POST' => 'CREAR',
        'PUT' => 'ACTUALIZAR',
        'PATCH' => 'ACTUALIZAR',
        'DELETE' => 'ELIMINAR',
    ];

    /**
     * Mapeo de prefijos de ruta a nombres de módulos.
     */
    private const MODULE_MAP = [
        'postulantes' => 'Postulantes',
        'docentes' => 'Docentes',
        'carreras' => 'Carreras',
        'grupos' => 'Grupos',
        'materias' => 'Materias',
        'aulas' => 'Aulas',
        'horarios' => 'Horarios',
        'usuarios' => 'Usuarios',
        'notas' => 'Notas',
        'pagos' => 'Pagos',
        'asistencias' => 'Asistencias',
        'importaciones' => 'Importaciones',
        'requisitos' => 'Requisitos',
        'roles' => 'Roles',
        'reportes' => 'Reportes',
        'dashboard' => 'Dashboard',
        'carga-horaria' => 'Carga Horaria',
        'auth' => 'Auth',
        'bitacora' => 'Bitácora',
        'cupos' => 'Cupos',
        'gestiones' => 'Gestiones',
        'facultades' => 'Facultades',
        'permisos' => 'Permisos',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo loguear métodos que modifican datos
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $response;
        }

        // Ignorar login/logout (ya se loguean manualmente en AuthController)
        if ($request->is('api/auth/*')) {
            return $response;
        }

        // Ignorar si no hay usuario autenticado
        if (!$request->user()) {
            return $response;
        }

        try {
            $user = $request->user();
            $action = self::ACTION_MAP[$request->method()] ?? $request->method();
            $module = $this->detectModule($request);
            $description = $this->buildDescription($request, $response);

            // Evitar duplicados: si ya existe un registro exacto en los últimos 5 segundos, no crear otro
            $tz = new \DateTimeZone('America/La_Paz');
            $now = new \DateTime('now', $tz);
            $recentExists = Bitacora::where('user_id', $user->id)
                ->where('module', $module)
                ->where('action', $action)
                ->where('created_at', '>=', $now->modify('-5 seconds'))
                ->exists();

            if (!$recentExists) {
                $this->logBitacora($action, $module, $description, $request);
            }
        } catch (\Throwable $e) {
            // La bitácora nunca debe romper una operación exitosa.
        }

        return $response;
    }

    private function detectModule(Request $request): string
    {
        $path = $request->path();
        $uri = $request->route()?->uri() ?? '';

        foreach (self::MODULE_MAP as $prefix => $name) {
            if (str_contains($path, $prefix) || str_contains($uri, $prefix)) {
                return $name;
            }
        }

        // Fallback: find the first non-numeric, non-'api' segment
        $segments = array_filter(
            explode('/', trim($path, '/')),
            fn($s) => $s !== '' && $s !== 'api' && !is_numeric($s)
        );

        $segment = reset($segments) ?: 'Sistema';

        return ucfirst($segment);
    }

    private function buildDescription(Request $request, Response $response): string
    {
        $method = $request->method();
        $path = $request->path();
        $action = self::ACTION_MAP[$method] ?? $method;
        $module = $this->detectModule($request);

        // Intentar extraer nombre del recurso del body
        $name = $this->extractResourceName($request);

        if ($name) {
            return "El usuario realizó la acción '{$action}' en el módulo {$module} sobre: {$name}.";
        }

        return "El usuario realizó la acción '{$action}' en el módulo {$module}.";
    }

    private function extractResourceName(Request $request): ?string
    {
        $data = $request->all();

        // Campos comunes que indican el nombre del recurso
        $nameFields = ['nombres', 'nombre', 'name', 'titulo', 'codigo', 'email', 'ci'];

        foreach ($nameFields as $field) {
            if (!empty($data[$field])) {
                return is_string($data[$field]) ? $data[$field] : json_encode($data[$field]);
            }
        }

        return null;
    }
}
