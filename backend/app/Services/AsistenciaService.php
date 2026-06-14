<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AsistenciaDocente;
use Illuminate\Http\Request;

class AsistenciaService
{
    public function listFiltered(Request $request)
    {
        $query = AsistenciaDocente::with(['docente', 'grupo', 'materia', 'horario']);

        if ($docenteId = $request->get('docente_id')) {
            $query->where('docente_id', $docenteId);
        }

        if ($grupoId = $request->get('grupo_id')) {
            $query->where('grupo_id', $grupoId);
        }

        if ($materiaId = $request->get('materia_id')) {
            $query->where('materia_id', $materiaId);
        }

        if ($fechaDesde = $request->get('fecha_desde')) {
            $query->whereDate('fecha', '>=', $fechaDesde);
        }

        if ($fechaHasta = $request->get('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $fechaHasta);
        }

        return $query->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function registerAsistencia(array $data, Request $request): AsistenciaDocente
    {
        $asistencia = AsistenciaDocente::create($data);

        log_bitacora(
            'REGISTRAR_ASISTENCIA',
            'Asistencias',
            "Se registró asistencia del docente ID {$data['docente_id']} - Estado: {$data['estado']} - Fecha: {$data['fecha']}.",
            null,
            $request
        );

        return $asistencia->load(['docente', 'grupo', 'materia', 'horario']);
    }
}
