<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Bitacora;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Trait para registrar acciones en la bitácora de forma explícita.
 * Cada controlador que use este trait debe llamar a logBitacora()
 * en los métodos que realizan acciones de escritura (crear, actualizar, eliminar, etc.).
 *
 * Zona horaria: America/La_Paz (Bolivia)
 */
trait HasBitacora
{
    /**
     * Registra una acción en la bitácora.
     *
     * @param string $action   Acción realizada (ej: CREAR, ACTUALIZAR, ELIMINAR)
     * @param string $module   Módulo afectado (ej: Postulantes, Usuarios, Pagos)
     * @param string $description Descripción detallada de la acción
     * @param Request|null $request Petición HTTP (opcional, toma la actual si no se pasa)
     * @param int|null $userId   ID del usuario (opcional, toma el autenticado si no se pasa)
     *
     * @return Bitacora|null
     */
    public function logBitacora(
        string $action,
        string $module,
        string $description,
        ?Request $request = null,
        ?int $userId = null
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

    /**
     * Alias corto para logBitacora.
     */
    public function bitacora(
        string $action,
        string $module,
        string $description,
        ?Request $request = null,
        ?int $userId = null
    ): ?Bitacora {
        return $this->logBitacora($action, $module, $description, $request, $userId);
    }
}
