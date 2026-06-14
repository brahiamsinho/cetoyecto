<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Aula;
use App\Models\AsistenciaDocente;
use App\Models\CargaHorariaDocente;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Horario;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class PopulateAcademicLoadCommand extends Command
{
    protected $signature = 'db:populate-academic-load {--refresh : Rebuild carga_horaria_docente and asistencias_docentes from scratch}';

    protected $description = 'Populate coherent carga horaria and attendance rows for the current groups.';

    private const MAX_SUBJECTS_PER_DOCENTE = 4;

    public function handle(): int
    {
        $grupos = Grupo::with(['materias' => fn ($query) => $query->orderBy('materias.id')])
            ->orderBy('id')
            ->get();

        $docentes = Docente::orderBy('id')->get();
        $aulas = Aula::orderBy('id')->get();
        $horarios = Horario::orderBy('id')->get();

        if ($grupos->isEmpty()) {
            $this->error('No groups were found.');

            return self::FAILURE;
        }

        if ($docentes->isEmpty() || $aulas->isEmpty() || $horarios->isEmpty()) {
            $this->error('Missing docentes, aulas, or horarios. Cannot build a coherent schedule.');

            return self::FAILURE;
        }

        $targetAssignments = $this->buildTargetAssignments($grupos);

        $result = DB::transaction(function () use ($targetAssignments, $docentes, $aulas, $horarios) {
            if ($this->option('refresh')) {
                AsistenciaDocente::query()->delete();
                CargaHorariaDocente::query()->delete();
            }

            $existingCharges = CargaHorariaDocente::query()->get();

            $state = $this->buildState($existingCharges);
            $createdCharges = 0;
            $createdAttendances = 0;
            $blockedAssignments = [];

            foreach ($existingCharges as $charge) {
                if ($this->attendanceExists($charge->docente_id, $charge->grupo_id, $charge->materia_id)) {
                    continue;
                }

                $attendanceDate = $this->nextAvailableAttendanceDate(
                    $charge->grupo_id,
                    $charge->materia_id,
                    Carbon::today()->addDays($createdAttendances)
                );

                AsistenciaDocente::create([
                    'docente_id' => $charge->docente_id,
                    'grupo_id' => $charge->grupo_id,
                    'materia_id' => $charge->materia_id,
                    'horario_id' => $charge->horario_id,
                    'fecha' => $attendanceDate->toDateString(),
                    'estado' => 'presente',
                    'observaciones' => 'Registro generado automáticamente para una carga horaria existente.',
                ]);

                $createdAttendances++;
            }

            foreach ($targetAssignments as $assignment) {
                $assignmentKey = $this->assignmentKey($assignment['grupo_id'], $assignment['materia_id']);

                if (isset($state['groupMateriaCovered'][$assignmentKey])) {
                    continue;
                }

                $placement = $this->findPlacement($docentes, $aulas, $horarios, $state);

                if ($placement === null) {
                    $blockedAssignments[] = $assignment;
                    continue;
                }

                $charge = CargaHorariaDocente::create([
                    'docente_id' => $placement['docente']->id,
                    'grupo_id' => $assignment['grupo_id'],
                    'materia_id' => $assignment['materia_id'],
                    'aula_id' => $placement['aula']->id,
                    'horario_id' => $placement['horario']->id,
                ]);

                $state['docenteLoads'][$placement['docente']->id] = ($state['docenteLoads'][$placement['docente']->id] ?? 0) + 1;
                $state['docenteHorarios'][$placement['docente']->id][$placement['horario']->id] = true;
                $state['aulaHorarios'][$placement['horario']->id][$placement['aula']->id] = true;
                $state['groupMateriaCovered'][$assignmentKey] = true;
                $state['chargeIds'][] = $charge->id;

                $attendanceDate = $this->nextAvailableAttendanceDate(
                    $assignment['grupo_id'],
                    $assignment['materia_id'],
                    Carbon::today()->addDays($createdAttendances)
                );

                AsistenciaDocente::create([
                    'docente_id' => $placement['docente']->id,
                    'grupo_id' => $assignment['grupo_id'],
                    'materia_id' => $assignment['materia_id'],
                    'horario_id' => $placement['horario']->id,
                    'fecha' => $attendanceDate->toDateString(),
                    'estado' => 'presente',
                    'observaciones' => 'Registro generado automáticamente por el comando de carga horaria.',
                ]);

                $createdCharges++;
                $createdAttendances++;
            }

            return [
                'createdCharges' => $createdCharges,
                'createdAttendances' => $createdAttendances,
                'blockedAssignments' => $blockedAssignments,
                'state' => $state,
                'requiredAssignments' => $targetAssignments->count(),
            ];
        });

        $filledAssignments = $result['requiredAssignments'] - count($result['blockedAssignments']);

        $this->info(sprintf(
            'Carga horaria populated: %d/%d assignments, %d new charge rows, %d attendance rows.',
            $filledAssignments,
            $result['requiredAssignments'],
            $result['createdCharges'],
            $result['createdAttendances']
        ));

        if (! empty($result['blockedAssignments'])) {
            $docenteCapacity = $docentes->count() * self::MAX_SUBJECTS_PER_DOCENTE;
            $slotCapacity = $aulas->count() * $horarios->count();
            $existingFilled = $result['requiredAssignments'] - count($result['blockedAssignments']);

            $this->warn(sprintf(
                'Maximal valid fill reached. Remaining assignments: %d. Limit check: docentes capacity %d, room-time slots %d, filled %d.',
                count($result['blockedAssignments']),
                $docenteCapacity,
                $slotCapacity,
                $existingFilled
            ));

            return self::SUCCESS;
        }

        return self::SUCCESS;
    }

    /**
     * @return array<int, array{grupo_id:int, materia_id:int}>
     */
    private function buildTargetAssignments(Collection $grupos): array
    {
        $groupPlans = $grupos->map(function (Grupo $grupo): array {
            $materias = $grupo->materias->sortBy('id')->values();

            if ($materias->count() !== 4) {
                $this->warn(sprintf(
                    'Group %s has %d materias; the command will use the first 4.',
                    $grupo->codigo,
                    $materias->count()
                ));
            }

            return [
                'grupo_id' => (int) $grupo->id,
                'materias' => $materias->take(self::MAX_SUBJECTS_PER_DOCENTE),
            ];
        })->values();

        $assignments = [];
        $maxMaterias = $groupPlans->map(fn (array $plan): int => $plan['materias']->count())->max() ?? 0;

        for ($materiaIndex = 0; $materiaIndex < $maxMaterias; $materiaIndex++) {
            foreach ($groupPlans as $plan) {
                $materia = $plan['materias']->get($materiaIndex);

                if (! $materia) {
                    continue;
                }

                $assignments[] = [
                    'grupo_id' => $plan['grupo_id'],
                    'materia_id' => (int) $materia->id,
                ];
            }
        }

        return $assignments;
    }

    /**
     * @return array{
     *     docenteLoads: array<int, int>,
     *     docenteHorarios: array<int, array<int, bool>>,
     *     aulaHorarios: array<int, array<int, bool>>,
     *     groupMateriaCovered: array<string, bool>,
     *     chargeIds: array<int>
     * }
     */
    private function buildState(Collection $existingCharges): array
    {
        $state = [
            'docenteLoads' => [],
            'docenteHorarios' => [],
            'aulaHorarios' => [],
            'groupMateriaCovered' => [],
            'chargeIds' => [],
        ];

        foreach ($existingCharges as $charge) {
            $state['docenteLoads'][$charge->docente_id] = ($state['docenteLoads'][$charge->docente_id] ?? 0) + 1;
            $state['docenteHorarios'][$charge->docente_id][$charge->horario_id] = true;
            $state['aulaHorarios'][$charge->horario_id][$charge->aula_id] = true;
            $state['groupMateriaCovered'][$this->assignmentKey($charge->grupo_id, $charge->materia_id)] = true;
            $state['chargeIds'][] = $charge->id;
        }

        return $state;
    }

    /**
     * @param array{
     *     docenteLoads: array<int, int>,
     *     docenteHorarios: array<int, array<int, bool>>,
     *     aulaHorarios: array<int, array<int, bool>>
     * } $state
     */
    private function findPlacement(Collection $docentes, Collection $aulas, Collection $horarios, array $state): ?array
    {
        $docentesOrdered = $docentes->sortBy(fn ($docente) => [
            $state['docenteLoads'][$docente->id] ?? 0,
            $docente->id,
        ])->values();

        $horariosOrdered = $horarios->sortBy(fn ($horario) => [
            $this->countHorarioOccupancy($state['aulaHorarios'], $horario->id),
            $horario->id,
        ])->values();

        foreach ($docentesOrdered as $docente) {
            if (($state['docenteLoads'][$docente->id] ?? 0) >= self::MAX_SUBJECTS_PER_DOCENTE) {
                continue;
            }

            foreach ($horariosOrdered as $horario) {
                if (isset($state['docenteHorarios'][$docente->id][$horario->id])) {
                    continue;
                }

                foreach ($aulas as $aula) {
                    if (isset($state['aulaHorarios'][$horario->id][$aula->id])) {
                        continue;
                    }

                    return [
                        'docente' => $docente,
                        'horario' => $horario,
                        'aula' => $aula,
                    ];
                }
            }
        }

        return null;
    }

    private function countHorarioOccupancy(array $aulaHorarios, int $horarioId): int
    {
        return isset($aulaHorarios[$horarioId]) ? count($aulaHorarios[$horarioId]) : 0;
    }

    private function assignmentKey(int $grupoId, int $materiaId): string
    {
        return $grupoId . ':' . $materiaId;
    }

    private function attendanceExists(int $docenteId, int $grupoId, int $materiaId): bool
    {
        return AsistenciaDocente::query()
            ->where('docente_id', $docenteId)
            ->where('grupo_id', $grupoId)
            ->where('materia_id', $materiaId)
            ->exists();
    }

    private function nextAvailableAttendanceDate(int $grupoId, int $materiaId, Carbon $seedDate): Carbon
    {
        $date = $seedDate->copy();

        while (AsistenciaDocente::query()
            ->where('grupo_id', $grupoId)
            ->where('materia_id', $materiaId)
            ->whereDate('fecha', $date->toDateString())
            ->exists()) {
            $date->addDay();
        }

        return $date;
    }
}
