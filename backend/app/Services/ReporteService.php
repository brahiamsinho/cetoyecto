<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AsistenciaDocente;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Postulante;
use Illuminate\Http\Request;

class ReporteService
{
    public function postulantesReport(?string $estadoPromedio = null)
    {
        $query = Postulante::with([
            'carreraPrimera',
            'carreraSegunda',
            'carreraAsignada',
            'gestion',
            'pago',
            'requisitos',
        ]);

        $postulantes = $query->orderBy('apellidos')->get();

        if ($estadoPromedio) {
            $postulantes = $postulantes->filter(function ($p) use ($estadoPromedio) {
                $estado = $p->estado_promedio;
                return $estado !== null && strtolower($estado) === strtolower($estadoPromedio);
            })->values();
        }

        return $postulantes;
    }

    public function aprobadosReport()
    {
        $postulantes = Postulante::whereHas('notas')
            ->with(['notas.materia', 'carreraAsignada'])
            ->get()
            ->filter(function ($p) {
                return $p->promedio_final >= 60;
            })
            ->values();

        return [
            'data' => $postulantes,
            'total' => $postulantes->count(),
        ];
    }

    public function reprobadosReport()
    {
        $postulantes = Postulante::whereHas('notas')
            ->with(['notas.materia', 'carreraAsignada'])
            ->get()
            ->filter(function ($p) {
                return $p->promedio_final < 60;
            })
            ->values();

        return [
            'data' => $postulantes,
            'total' => $postulantes->count(),
        ];
    }

    public function promediosReport()
    {
        return Postulante::whereHas('notas')
            ->with(['notas.materia', 'carreraAsignada'])
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'ci' => $p->ci,
                    'nombres' => $p->nombres,
                    'apellidos' => $p->apellidos,
                    'carrera_asignada' => $p->carreraAsignada?->nombre,
                    'promedio_final' => $p->promedio_final,
                    'estado' => $p->estado_promedio,
                ];
            })
            ->sortByDesc('promedio_final')
            ->values();
    }

    public function gruposReport()
    {
        return Grupo::with('materias')
            ->withCount('postulantes as estudiantes_count')
            ->orderBy('nombre')
            ->get();
    }

    public function estadisticasMateriaReport()
    {
        return Materia::with('notas')->get()->map(function ($materia) {
            $promedios = $materia->notas->pluck('promedio')->filter();

            return [
                'materia_id' => $materia->id,
                'materia' => $materia->nombre,
                'codigo' => $materia->codigo,
                'total_estudiantes' => $materia->notas->count(),
                'promedio_general' => $promedios->isNotEmpty() ? round($promedios->avg(), 2) : 0,
                'nota_max' => $promedios->isNotEmpty() ? $promedios->max() : 0,
                'nota_min' => $promedios->isNotEmpty() ? $promedios->min() : 0,
            ];
        });
    }

    public function docentesGruposReport()
    {
        return Docente::with(['cargasHorarias' => function ($q) {
            $q->with(['grupo', 'materia', 'aula', 'horario']);
        }])->where('contratado', true)
            ->orderBy('apellidos')
            ->get()
            ->map(function ($docente) {
                return [
                    'id' => $docente->id,
                    'nombres' => $docente->nombres,
                    'apellidos' => $docente->apellidos,
                    'profesion' => $docente->profesion,
                    'grupos_asignados' => $docente->cargasHorarias->map(function ($carga) {
                        return [
                            'grupo' => $carga->grupo?->nombre,
                            'materia' => $carga->materia?->nombre,
                            'aula' => $carga->aula?->nombre,
                            'horario' => $carga->horario ? "{$carga->horario->dia} {$carga->horario->hora_inicio}-{$carga->horario->hora_fin}" : null,
                        ];
                    }),
                    'total_grupos' => $docente->cargasHorarias->count(),
                ];
            });
    }

    public function gruposMasAprobadosReport()
    {
        return Grupo::with(['postulantes.notas', 'materias'])
            ->withCount('postulantes as total_estudiantes')
            ->get()
            ->map(function ($grupo) {
                $aprobados = $grupo->postulantes->filter(function ($p) {
                    return $p->promedio_final >= 60;
                })->count();

                return [
                    'grupo_id' => $grupo->id,
                    'grupo' => $grupo->nombre,
                    'materia' => $grupo->materias->first()?->nombre,
                    'total_estudiantes' => $grupo->total_estudiantes,
                    'aprobados' => $aprobados,
                    'reprobados' => $grupo->total_estudiantes - $aprobados,
                    'porcentaje_aprobacion' => $grupo->total_estudiantes > 0
                        ? round(($aprobados / $grupo->total_estudiantes) * 100, 2)
                        : 0,
                ];
            })
            ->sortByDesc('porcentaje_aprobacion')
            ->values();
    }

    public function asistenciaDocenteReport(Request $request)
    {
        $query = AsistenciaDocente::with(['docente', 'grupo', 'materia', 'horario']);

        if ($docenteId = $request->get('docente_id')) {
            $query->where('docente_id', $docenteId);
        }

        $fechaDesde = $request->get('fecha_desde') ?? $request->get('desde');
        $fechaHasta = $request->get('fecha_hasta') ?? $request->get('hasta');

        if ($fechaDesde) {
            $query->whereDate('fecha', '>=', $fechaDesde);
        }

        if ($fechaHasta) {
            $query->whereDate('fecha', '<=', $fechaHasta);
        }

        $asistencias = $query->orderBy('fecha', 'desc')->get();

        return $asistencias->map(function ($asistencia) {
            return [
                'id' => $asistencia->id,
                'docente' => $asistencia->docente
                    ? $asistencia->docente->nombres . ' ' . $asistencia->docente->apellidos
                    : '—',
                'grupo' => $asistencia->grupo?->nombre,
                'materia' => $asistencia->materia?->nombre,
                'fecha' => $asistencia->fecha?->format('Y-m-d'),
                'estado' => $asistencia->estado,
                'observaciones' => $asistencia->observaciones,
                'horario' => $asistencia->horario
                    ? $asistencia->horario->dia . ' ' . $asistencia->horario->hora_inicio . '-' . $asistencia->horario->hora_fin
                    : null,
            ];
        });
    }

    public function cuposCarreraReport()
    {
        return Carrera::where('activo', true)
            ->withCount('postulantesAsignados as total_admitidos')
            ->get()
            ->map(function ($carrera) {
                return [
                    'id' => $carrera->id,
                    'codigo' => $carrera->codigo,
                    'nombre' => $carrera->nombre,
                    'cupo_maximo' => $carrera->cupo_maximo,
                    'cupo_actual' => $carrera->cupo_actual,
                    'cupo_disponible' => $carrera->cupo_disponible,
                    'porcentaje_ocupacion' => $carrera->cupo_maximo > 0
                        ? round(($carrera->cupo_actual / $carrera->cupo_maximo) * 100, 2)
                        : 0,
                ];
            });
    }
}
