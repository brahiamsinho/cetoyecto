<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AsistenciaDocente;
use App\Models\Aula;
use App\Models\CargaHorariaDocente;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Horario;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PopulateCargaHorariaCommand extends Command
{
    protected $signature = 'demo:populate-carga-horaria';

    protected $description = 'Populate carga horaria and asistencias using current groups, materias, aulas and horarios.';

    private const MAX_SUBJECTS_PER_DOCENTE = 4;

    private const MATERIAS_ORDEN = ['Computación', 'Física', 'Inglés', 'Matemáticas'];

    private const GROUP_SCHEDULES = [
        'Z1' => [
            ['dia' => 'Lunes', 'hora_inicio' => '07:00:00', 'hora_fin' => '08:30:00', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '08:30:00', 'hora_fin' => '10:00:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '07:00:00', 'hora_fin' => '09:15:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '09:15:00', 'hora_fin' => '11:30:00', 'turno' => 'mañana'],
        ],
        'Z2' => [
            ['dia' => 'Lunes', 'hora_inicio' => '14:00:00', 'hora_fin' => '15:30:00', 'turno' => 'tarde'],
            ['dia' => 'Lunes', 'hora_inicio' => '15:30:00', 'hora_fin' => '17:00:00', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '14:00:00', 'hora_fin' => '16:15:00', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '16:15:00', 'hora_fin' => '18:00:00', 'turno' => 'tarde'],
        ],
        'Z3' => [
            ['dia' => 'Lunes', 'hora_inicio' => '07:00:00', 'hora_fin' => '08:30:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '07:00:00', 'hora_fin' => '09:15:00', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '14:00:00', 'hora_fin' => '15:30:00', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '14:00:00', 'hora_fin' => '16:15:00', 'turno' => 'tarde'],
        ],
        'Z4' => [
            ['dia' => 'Lunes', 'hora_inicio' => '08:30:00', 'hora_fin' => '10:00:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '09:15:00', 'hora_fin' => '11:30:00', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '15:30:00', 'hora_fin' => '17:00:00', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '16:15:00', 'hora_fin' => '18:00:00', 'turno' => 'tarde'],
        ],
        'Z5' => [
            ['dia' => 'Martes', 'hora_inicio' => '07:00:00', 'hora_fin' => '09:15:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '09:15:00', 'hora_fin' => '11:30:00', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '14:00:00', 'hora_fin' => '15:30:00', 'turno' => 'tarde'],
            ['dia' => 'Lunes', 'hora_inicio' => '15:30:00', 'hora_fin' => '17:00:00', 'turno' => 'tarde'],
        ],
    ];

    private const ATTENDANCE_BASE_DATE = '2026-01-05';

    public function handle(): int
    {
        $groups = Grupo::with(['materias' => fn ($query) => $query->orderBy('nombre')])
            ->whereIn('codigo', ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'])
            ->orderBy('codigo')
            ->get();

        $docentes = Docente::orderBy('id')->get()->values();
        $aulas = Aula::orderBy('id')->get()->values();

        if ($groups->isEmpty()) {
            $this->error('No se encontraron grupos Z1-Z5 para regenerar la carga horaria.');

            return self::FAILURE;
        }

        if ($docentes->isEmpty() || $aulas->isEmpty()) {
            $this->error('No hay docentes o aulas disponibles para generar la carga horaria.');

            return self::FAILURE;
        }

        $horarios = $this->ensureRequiredHorarios();
        $horariosByKey = $horarios->keyBy(fn (Horario $horario) => $this->horarioKey(
            $horario->dia,
            (string) $horario->hora_inicio,
            (string) $horario->hora_fin,
        ));

        DB::transaction(function () use ($groups, $docentes, $aulas, $horariosByKey): void {
            AsistenciaDocente::query()->delete();
            CargaHorariaDocente::query()->delete();

            $usedDocenteHorario = [];
            $usedAulaHorario = [];
            $teacherLoads = [];
            $teacherSubjects = [];
            $attendanceBaseDate = Carbon::createFromFormat('Y-m-d', self::ATTENDANCE_BASE_DATE)->startOfDay();
            $attendanceIndex = 0;
            $aulaSeed = 0;

            $groupPlans = $groups->map(function (Grupo $group): array {
                $scheduleSpecs = self::GROUP_SCHEDULES[$group->codigo] ?? null;

                return [
                    'group' => $group,
                    'scheduleSpecs' => $scheduleSpecs,
                    'materias' => $group->materias
                        ->sortBy(function ($materia) {
                            $position = array_search($materia->nombre, self::MATERIAS_ORDEN, true);

                            return $position === false ? PHP_INT_MAX : $position;
                        })
                        ->values(),
                ];
            })->filter(fn (array $plan): bool => $plan['scheduleSpecs'] !== null)->values();

            $maxMaterias = $groupPlans->map(fn (array $plan): int => $plan['materias']->count())->max() ?? 0;

            for ($materiaIndex = 0; $materiaIndex < $maxMaterias; $materiaIndex++) {
                foreach ($groupPlans as $plan) {
                    /** @var Grupo $group */
                    $group = $plan['group'];
                    $scheduleSpecs = $plan['scheduleSpecs'];
                    $materia = $plan['materias']->get($materiaIndex);

                    if (! $materia || ! isset($scheduleSpecs[$materiaIndex])) {
                        continue;
                    }

                    $subject = $materia->nombre;
                    $subjectCounters[$subject] = $subjectCounters[$subject] ?? 0;

                    $scheduleSpec = $scheduleSpecs[$materiaIndex];
                    $scheduleKey = $this->horarioKey(
                        $scheduleSpec['dia'],
                        $scheduleSpec['hora_inicio'],
                        $scheduleSpec['hora_fin'],
                    );

                    /** @var Horario|null $horario */
                    $horario = $horariosByKey->get($scheduleKey);

                    if (! $horario) {
                        throw new \RuntimeException("No existe el horario requerido {$scheduleKey}.");
                    }

                    $docente = $this->pickDocente(
                        $subject,
                        $docentes,
                        $teacherLoads,
                        $teacherSubjects,
                        $usedDocenteHorario,
                        (int) $horario->id,
                    );

                    $aula = $this->pickAula(
                        $aulas,
                        $usedAulaHorario,
                        (int) $horario->id,
                        $aulaSeed,
                    );

                    CargaHorariaDocente::create([
                        'docente_id' => $docente->id,
                        'grupo_id' => $group->id,
                        'materia_id' => $materia->id,
                        'aula_id' => $aula->id,
                        'horario_id' => $horario->id,
                    ]);

                    AsistenciaDocente::create([
                        'docente_id' => $docente->id,
                        'grupo_id' => $group->id,
                        'materia_id' => $materia->id,
                        'horario_id' => $horario->id,
                        'fecha' => $attendanceBaseDate->copy()->addDays($attendanceIndex)->toDateString(),
                        'estado' => 'presente',
                        'observaciones' => 'Asistencia generada automáticamente.',
                    ]);

                    $usedDocenteHorario[$docente->id][$horario->id] = true;
                    $usedAulaHorario[$horario->id][$aula->id] = true;
                    $attendanceIndex++;
                    $aulaSeed++;
                }
            }
        });

        $this->info('Carga horaria y asistencias generadas correctamente.');

        return self::SUCCESS;
    }

    /**
     * @return Collection<int, Horario>
     */
    private function ensureRequiredHorarios(): Collection
    {
        foreach (self::GROUP_SCHEDULES as $groupSchedules) {
            foreach ($groupSchedules as $spec) {
                Horario::firstOrCreate(
                    [
                        'dia' => $spec['dia'],
                        'hora_inicio' => $spec['hora_inicio'],
                        'hora_fin' => $spec['hora_fin'],
                    ],
                    [
                        'turno' => $spec['turno'],
                    ]
                );
            }
        }

        return Horario::orderBy('id')->get()->values();
    }

    private function horarioKey(string $dia, string $inicio, string $fin): string
    {
        return $dia . '|' . $inicio . '|' . $fin;
    }

    /**
     * @param array<int, array<int, bool>> $usedDocenteHorario
     */
    private function pickDocente(
        string $subject,
        Collection $docentes,
        array &$teacherLoads,
        array &$teacherSubjects,
        array &$usedDocenteHorario,
        int $horarioId,
    ): Docente {
        $preferred = $this->eligibleDocentesForSubject($subject, $docentes);
        $preferred = $preferred->isEmpty() ? $docentes->values() : $preferred->values();

        foreach ($this->orderDocentesByLoad($preferred, $teacherLoads) as $docente) {
            if (isset($usedDocenteHorario[$docente->id][$horarioId])) {
                continue;
            }

            $assignedSubjects = $teacherSubjects[$docente->id] ?? [];
            if (! isset($assignedSubjects[$subject]) && count($assignedSubjects) >= self::MAX_SUBJECTS_PER_DOCENTE) {
                continue;
            }

            $teacherLoads[$docente->id] = ($teacherLoads[$docente->id] ?? 0) + 1;
            $teacherSubjects[$docente->id][$subject] = true;

            return $docente;
        }

        foreach ($this->orderDocentesByLoad($docentes->values(), $teacherLoads) as $docente) {
            if (isset($usedDocenteHorario[$docente->id][$horarioId])) {
                continue;
            }

            $assignedSubjects = $teacherSubjects[$docente->id] ?? [];
            if (! isset($assignedSubjects[$subject]) && count($assignedSubjects) >= self::MAX_SUBJECTS_PER_DOCENTE) {
                continue;
            }

            $teacherLoads[$docente->id] = ($teacherLoads[$docente->id] ?? 0) + 1;
            $teacherSubjects[$docente->id][$subject] = true;

            return $docente;
        }

        throw new \RuntimeException("No se encontró un docente disponible para {$subject} en el horario {$horarioId}.");
    }

    /**
     * @param Collection<int, Docente> $docentes
     * @return Collection<int, Docente>
     */
    private function orderDocentesByLoad(Collection $docentes, array $teacherLoads): Collection
    {
        return $docentes->sortBy(fn (Docente $docente) => [
            $teacherLoads[$docente->id] ?? 0,
            $docente->id,
        ])->values();
    }

    private function eligibleDocentesForSubject(string $subject, Collection $docentes): Collection
    {
        $keywordsBySubject = [
            'Computación' => ['comput', 'sistem', 'red'],
            'Física' => ['fis'],
            'Inglés' => ['ingles', 'leng'],
            'Matemáticas' => ['mat'],
        ];

        $keywords = $keywordsBySubject[$subject] ?? [];

        if ($keywords === []) {
            return $docentes->values();
        }

        return $docentes->filter(function (Docente $docente) use ($keywords): bool {
            $profesion = Str::ascii(Str::lower((string) $docente->profesion));

            foreach ($keywords as $keyword) {
                if (str_contains($profesion, $keyword)) {
                    return true;
                }
            }

            return false;
        })->values();
    }

    /**
     * @param array<int, array<int, bool>> $usedAulaHorario
     */
    private function pickAula(Collection $aulas, array &$usedAulaHorario, int $horarioId, int $seed = 0): Aula
    {
        $orderedAulas = $aulas->slice($seed % max(1, $aulas->count()))->values()->concat($aulas->take($seed % max(1, $aulas->count())));

        foreach ($orderedAulas as $aula) {
            if (isset($usedAulaHorario[$horarioId][$aula->id])) {
                continue;
            }

            return $aula;
        }

        throw new \RuntimeException("No se encontró un aula disponible para el horario {$horarioId}.");
    }
}
