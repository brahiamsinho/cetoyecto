<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CargaHorariaDocente;
use App\Models\Docente;

class DocenteService
{
    public function validarRequisitos(Docente $docente): array
    {
        $resultados = [
            'profesion_valida' => !empty($docente->profesion),
            'maestria' => (bool) $docente->maestria,
            'diplomado_educacion_superior' => (bool) $docente->diplomado_educacion_superior,
        ];

        $todosCumplidos = $resultados['profesion_valida']
            && $resultados['maestria']
            && $resultados['diplomado_educacion_superior'];

        if ($todosCumplidos && !$docente->contratado) {
            $docente->update(['contratado' => true]);
        }

        return [
            'resultados' => $resultados,
            'todos_cumplidos' => $todosCumplidos,
            'contratado' => $todosCumplidos,
        ];
    }

    public function contarGruposAsignados(Docente $docente): int
    {
        return CargaHorariaDocente::where('docente_id', $docente->id)->count();
    }

    public function verificarConflictoHorario(Docente $docente, int $horarioId): bool
    {
        return CargaHorariaDocente::where('docente_id', $docente->id)
            ->where('horario_id', $horarioId)
            ->exists();
    }

    public function verificarConflictoAula(int $aulaId, int $horarioId, ?int $excludeId = null): bool
    {
        $query = CargaHorariaDocente::where('aula_id', $aulaId)
            ->where('horario_id', $horarioId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
