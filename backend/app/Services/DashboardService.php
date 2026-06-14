<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Postulante;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        $capacidad = (int) config('cup.capacidad_grupo', 70);

        // ── KPIs ────────────────────────────────────────────────────────────
        $totalInscritos  = Postulante::whereNotIn('estado', ['rechazado'])->whereNull('deleted_at')->count();
        $totalGrupos     = Grupo::count();
        $totalDocentes   = Docente::where('contratado', true)->count();
        $totalCarreras   = Carrera::where('activo', true)->count();

        // Aprobados / reprobados via SQL (avg promedio per postulante)
        $promediosPorPostulante = DB::table('notas')
            ->join('postulantes', 'notas.postulante_id', '=', 'postulantes.id')
            ->whereNotIn('postulantes.estado', ['rechazado'])
            ->whereNull('postulantes.deleted_at')
            ->selectRaw('notas.postulante_id, AVG(notas.promedio) as promedio_final')
            ->groupBy('notas.postulante_id')
            ->get();

        $totalAprobados  = $promediosPorPostulante->where('promedio_final', '>=', 60)->count();
        $totalReprobados = $promediosPorPostulante->where('promedio_final', '<', 60)->count();
        $conNotas        = $promediosPorPostulante->count();
        $tasaAprobacion  = $conNotas > 0 ? round($totalAprobados / $conNotas * 100, 1) : 0;

        // ── Por carrera ──────────────────────────────────────────────────────
        $carreras = Carrera::where('activo', true)->get(['id', 'codigo', 'nombre']);

        $postByCarrera = DB::table('postulantes')
            ->whereNotIn('estado', ['rechazado'])
            ->whereNull('deleted_at')
            ->selectRaw('carrera_primera_id, COUNT(*) as total')
            ->groupBy('carrera_primera_id')
            ->pluck('total', 'carrera_primera_id');

        $aprobByCarrera = DB::table('notas')
            ->join('postulantes', 'notas.postulante_id', '=', 'postulantes.id')
            ->whereNotIn('postulantes.estado', ['rechazado'])
            ->whereNull('postulantes.deleted_at')
            ->selectRaw('postulantes.carrera_primera_id, postulantes.id, AVG(notas.promedio) as prom')
            ->groupBy('postulantes.carrera_primera_id', 'postulantes.id')
            ->get()
            ->groupBy('carrera_primera_id')
            ->map(fn ($rows) => $rows->where('prom', '>=', 60)->count());

        $porCarrera = $carreras->map(fn ($c) => [
            'carrera_id'        => $c->id,
            'codigo'            => $c->codigo,
            'nombre'            => $c->nombre,
            'total_postulantes' => (int) ($postByCarrera[$c->id] ?? 0),
            'total_admitidos'   => (int) ($aprobByCarrera[$c->id] ?? 0),
            'total_reprobados'  => (int) (($postByCarrera[$c->id] ?? 0) - ($aprobByCarrera[$c->id] ?? 0)),
        ])->values();

        // ── Por materia ──────────────────────────────────────────────────────
        $notaStats = DB::table('notas')
            ->join('materias', 'notas.materia_id', '=', 'materias.id')
            ->selectRaw('notas.materia_id, materias.nombre, COUNT(*) as total, AVG(notas.promedio) as promedio_avg, SUM(CASE WHEN notas.promedio >= 60 THEN 1 ELSE 0 END) as aprobados')
            ->groupBy('notas.materia_id', 'materias.nombre')
            ->get()
            ->keyBy('materia_id');

        $materias   = Materia::all(['id', 'nombre']);
        $porMateria = $materias->map(function ($m) use ($notaStats) {
            $row       = $notaStats->get($m->id);
            $total     = (int) ($row?->total ?? 0);
            $aprobados = (int) ($row?->aprobados ?? 0);
            return [
                'materia_id'      => $m->id,
                'nombre'          => $m->nombre,
                'promedio_avg'    => $total > 0 ? round((float) $row->promedio_avg, 1) : 0,
                'total'           => $total,
                'aprobados'       => $aprobados,
                'reprobados'      => $total - $aprobados,
                'tasa_aprobacion' => $total > 0 ? round($aprobados / $total * 100, 1) : 0,
            ];
        })->values();

        // ── Por grupo ────────────────────────────────────────────────────────
        $porGrupo = Grupo::withCount('postulantes as total')
            ->orderByRaw("CAST(SUBSTR(codigo, 2) AS INTEGER)")
            ->get()
            ->map(fn ($g) => [
                'grupo'     => $g->codigo,
                'total'     => $g->total,
                'capacidad' => $capacidad,
            ])->values();

        // ── Distribución por sexo ────────────────────────────────────────────
        $sexoCounts = Postulante::whereNotIn('estado', ['rechazado'])
            ->whereNull('deleted_at')
            ->selectRaw('sexo, count(*) as total')
            ->groupBy('sexo')
            ->pluck('total', 'sexo');

        $distribucionSexo = [
            ['sexo' => 'Masculino', 'total' => (int) ($sexoCounts['M'] ?? 0)],
            ['sexo' => 'Femenino',  'total' => (int) ($sexoCounts['F'] ?? 0)],
        ];

        return [
            'total_inscritos'       => $totalInscritos,
            'total_aprobados'       => $totalAprobados,
            'total_reprobados'      => $totalReprobados,
            'tasa_aprobacion'       => $tasaAprobacion,
            'total_grupos'          => $totalGrupos,
            'total_docentes'        => $totalDocentes,
            'total_carreras'        => $totalCarreras,
            'admitidos_por_carrera' => $porCarrera,
            'promedio_por_materia'  => $porMateria,
            'postulantes_por_grupo' => $porGrupo,
            'distribucion_sexo'     => $distribucionSexo,
        ];
    }
}
