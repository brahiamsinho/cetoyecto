<?php

declare(strict_types=1);

use App\Models\Bitacora;
use Illuminate\Http\Request;

if (!function_exists('log_bitacora')) {
    /**
     * Registra una acción en la bitácora con timezone de Bolivia (America/La_Paz).
     *
     * @param string $action    Acción realizada (ej: CREAR, ACTUALIZAR, ELIMINAR)
     * @param string $module    Módulo afectado (ej: Postulantes, Usuarios, Pagos)
     * @param string $description Descripción detallada de la acción
     * @param int|null $userId  ID del usuario (opcional, toma el autenticado si no se pasa)
     * @param Request|null $request Petición HTTP (opcional)
     *
     * @return Bitacora|null
     */
    function log_bitacora(
        string $action,
        string $module,
        string $description,
        ?int $userId = null,
        ?Request $request = null
    ): ?Bitacora {
        $request = $request ?? request();
        $userId = $userId ?? (Auth::id() ?? ($request->user()?->id));

        if (!$userId) {
            return null;
        }

        // Usar timezone de Bolivia (UTC-4)
        $tz = new \DateTimeZone('America/La_Paz');
        $now = new \DateTime('now', $tz);

        return Bitacora::create([
            'user_id' => $userId,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
