<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Bitacora;
use Illuminate\Http\Request;

class BitacoraService
{
    public function getFiltered(Request $request)
    {
        $query = Bitacora::with('user:id,name,email');

        if ($modulo = $request->get('module')) {
            $query->where('module', $modulo);
        }

        if ($accion = $request->get('action')) {
            $query->where('action', $accion);
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($fechaDesde = $request->get('fecha_desde')) {
            $query->whereDate('created_at', '>=', $fechaDesde);
        }

        if ($fechaHasta = $request->get('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $fechaHasta);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));
    }
}
