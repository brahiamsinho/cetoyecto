<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Carrera;
use App\Models\Postulante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CupoService
{
    public function resolverPorMerito(): array
    {
        // 1. Reset all assignments
        DB::table('postulantes')
            ->whereNull('deleted_at')
            ->update(['carrera_asignada_id' => null, 'estado' => 'inscrito']);

        DB::table('carreras')->update(['cupo_actual' => 0]);

        // 2. Compute promedio_final in SQL: avg of per-materia averages, filter >= 60, sort DESC
        $aprobados = DB::select("
            SELECT p.id, p.nombres, p.apellidos, p.carrera_primera_id, p.carrera_segunda_id,
                   ROUND(CAST(AVG(sub.materia_avg) AS NUMERIC), 2) AS promedio_final
            FROM postulantes p
            JOIN (
                SELECT postulante_id, materia_id, AVG(promedio) AS materia_avg
                FROM notas
                GROUP BY postulante_id, materia_id
            ) sub ON sub.postulante_id = p.id
            WHERE p.deleted_at IS NULL
            GROUP BY p.id, p.nombres, p.apellidos, p.carrera_primera_id, p.carrera_segunda_id
            HAVING AVG(sub.materia_avg) >= 60
            ORDER BY promedio_final DESC
        ");

        // 3. Load carrera limits
        $carreras   = Carrera::where('activo', true)->get()->keyBy('id');
        $cupoCount  = $carreras->mapWithKeys(fn ($c) => [$c->id => 0])->toArray();

        $admitidos  = [];   // postulante_id => carrera_id
        $pendientes = [];   // approved but couldn't get primera opcion

        // 4. Primera opción — highest promedio first
        foreach ($aprobados as $p) {
            $cid = $p->carrera_primera_id;
            if ($cid && isset($carreras[$cid]) && $cupoCount[$cid] < $carreras[$cid]->cupo_maximo) {
                $admitidos[$p->id] = $cid;
                $cupoCount[$cid]++;
            } else {
                $pendientes[] = $p;
            }
        }

        // 5. Segunda opción for those who didn't make primera
        $rechazados = [];
        foreach ($pendientes as $p) {
            $cid = $p->carrera_segunda_id;
            if ($cid && isset($carreras[$cid]) && $cupoCount[$cid] < $carreras[$cid]->cupo_maximo) {
                $admitidos[$p->id] = $cid;
                $cupoCount[$cid]++;
            } else {
                $rechazados[] = $p->id;
            }
        }

        // 6. Bulk update admitted
        foreach ($admitidos as $pid => $cid) {
            DB::table('postulantes')->where('id', $pid)
                ->update(['estado' => 'admitido', 'carrera_asignada_id' => $cid]);
        }

        // 7. Bulk update rejected
        if ($rechazados) {
            DB::table('postulantes')->whereIn('id', $rechazados)
                ->update(['estado' => 'rechazado', 'carrera_asignada_id' => null]);
        }

        // 8. Update cupo_actual per carrera
        foreach ($cupoCount as $cid => $count) {
            DB::table('carreras')->where('id', $cid)->update(['cupo_actual' => $count]);
        }

        // 9. Build summary
        $porCarrera = $carreras->map(fn ($c) => [
            'carrera'     => $c->nombre,
            'cupo_maximo' => $c->cupo_maximo,
            'admitidos'   => $cupoCount[$c->id] ?? 0,
            'disponibles' => $c->cupo_maximo - ($cupoCount[$c->id] ?? 0),
        ])->values();

        return [
            'total_admitidos'  => count($admitidos),
            'total_rechazados' => count($rechazados),
            'total_reprobados_sin_cupo' => DB::table('postulantes')->whereNull('deleted_at')
                ->where('estado', 'inscrito')->count(),
            'por_carrera'      => $porCarrera,
        ];
    }


    public function asignarCarrera(Postulante $postulante, Request $request): Postulante
    {
        $primeraOpcion = Carrera::find($postulante->carrera_primera_id);
        $segundaOpcion = Carrera::find($postulante->carrera_segunda_id);

        if ($primeraOpcion && $primeraOpcion->cupo_disponible > 0) {
            $primeraOpcion->increment('cupo_actual');
            $postulante->update([
                'carrera_asignada_id' => $primeraOpcion->id,
                'estado' => 'admitido',
            ]);

            log_bitacora(
                'ASIGNAR_CARRERA',
                'Cupos',
                "Se asignó carrera '{$primeraOpcion->nombre}' al postulante {$postulante->nombres} {$postulante->apellidos} (primera opción).",
                null,
                $request
            );
        } elseif ($segundaOpcion && $segundaOpcion->cupo_disponible > 0) {
            $segundaOpcion->increment('cupo_actual');
            $postulante->update([
                'carrera_asignada_id' => $segundaOpcion->id,
                'estado' => 'admitido',
            ]);

            log_bitacora(
                'ASIGNAR_CARRERA',
                'Cupos',
                "Se asignó carrera '{$segundaOpcion->nombre}' al postulante {$postulante->nombres} {$postulante->apellidos} (segunda opción).",
                null,
                $request
            );
        } else {
            $postulante->update([
                'carrera_asignada_id' => null,
                'estado' => 'rechazado',
            ]);

            log_bitacora(
                'RECHAZAR',
                'Cupos',
                "El postulante {$postulante->nombres} {$postulante->apellidos} fue rechazado por falta de cupos.",
                null,
                $request
            );
        }

        return $postulante->fresh()->load('carreraAsignada');
    }
}
