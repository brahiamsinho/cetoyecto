<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Postulante;
use App\Models\RequisitoPostulante;
use Illuminate\Http\Request;

class RequisitoService
{
    public function listForPostulante(int $postulanteId)
    {
        Postulante::findOrFail($postulanteId);

        return RequisitoPostulante::where('postulante_id', $postulanteId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(int $postulanteId, string $tipoRequisito, Request $request): RequisitoPostulante
    {
        $postulante = Postulante::findOrFail($postulanteId);

        $requisito = RequisitoPostulante::create([
            'postulante_id' => $postulanteId,
            'tipo_requisito' => $tipoRequisito,
            'cumplido' => false,
        ]);

        log_bitacora(
            'CREAR',
            'Requisitos',
            "Se agregó el requisito '{$tipoRequisito}' al postulante {$postulante->nombres} {$postulante->apellidos}.",
            null,
            $request
        );

        return $requisito;
    }

    public function toggle(int $id, Request $request): RequisitoPostulante
    {
        $requisito = RequisitoPostulante::findOrFail($id);
        $requisito->update(['cumplido' => !$requisito->cumplido]);

        $estado = $requisito->cumplido ? 'cumplido' : 'no cumplido';

        log_bitacora(
            'TOGGLE',
            'Requisitos',
            "Se marcó el requisito '{$requisito->tipo_requisito}' como {$estado}.",
            null,
            $request
        );

        return $requisito->fresh();
    }
}
