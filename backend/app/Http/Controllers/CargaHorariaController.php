<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CargaHorariaDocente;
use App\Http\Requests\StoreCargaHorariaRequest;
use App\Traits\HasBitacora;
use App\Models\AsistenciaDocente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;

class CargaHorariaController extends Controller
{
    use HasBitacora;
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $cargas = CargaHorariaDocente::with([
                'docente',
                'grupo.materias',
                'grupo.postulantes',
                'materia',
                'aula',
                'horario',
            ])->orderBy('created_at', 'desc')->get();

            $cargas->each(function (CargaHorariaDocente $carga): void {
                $carga->setAttribute('horario_display', $this->formatHorarioDisplay($carga));
                $carga->setAttribute('aula_display', $this->formatAulaDisplay($carga));
            });

            return response()->json([
                'success' => true,
                'data' => $cargas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar carga horaria: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreCargaHorariaRequest $request): JsonResponse
    {
        try {
            $carga = CargaHorariaDocente::create($request->validated());

            $this->logBitacora(
                'CREAR',
                'CargaHoraria',
                "Se asignó carga horaria - Docente ID: {$request->docente_id}, Grupo ID: {$request->grupo_id}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => tap($carga->load(['docente', 'grupo', 'materia', 'aula', 'horario']), function (CargaHorariaDocente $loaded): void {
                    $loaded->setAttribute('horario_display', $this->formatHorarioDisplay($loaded));
                    $loaded->setAttribute('aula_display', $this->formatAulaDisplay($loaded));
                }),
                'message' => 'Carga horaria creada correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear carga horaria: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function regenerarDataset(Request $request): JsonResponse
    {
        try {
            $exitCode = Artisan::call('demo:populate-carga-horaria');
            $output = trim(Artisan::output());

            if ($exitCode !== 0) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => $output !== '' ? $output : 'No se pudo regenerar la carga horaria.',
                    'exit_code' => $exitCode,
                    'command_output' => $output,
                ], 500);
            }

            $cargaHorariaTotal = CargaHorariaDocente::count();
            $asistenciasTotal = AsistenciaDocente::count();

            try {
                $this->logBitacora(
                    'REGENERAR',
                    'CargaHoraria',
                    'Se regeneró la carga horaria y asistencias automáticas.',
                    $request
                );
            } catch (\Throwable $logException) {
                // Logging must never turn a successful regeneration into a 500.
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => "Carga horaria y asistencias regeneradas correctamente. Se generaron {$cargaHorariaTotal} asignaciones y {$asistenciasTotal} asistencias.",
                'data' => [
                    'carga_horaria_total' => $cargaHorariaTotal,
                    'asistencias_total' => $asistenciasTotal,
                ],
                'exit_code' => $exitCode,
                'command_output' => $output,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al regenerar carga horaria: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $carga = CargaHorariaDocente::findOrFail($id);
            $carga->delete();

            $this->logBitacora(
                'ELIMINAR',
                'CargaHoraria',
                "Se eliminó la carga horaria ID {$id}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Carga horaria eliminada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar carga horaria: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function docente(int $docenteId): JsonResponse
    {
        try {
            $cargas = CargaHorariaDocente::with(['grupo', 'materia', 'aula', 'horario'])
                ->where('docente_id', $docenteId)
                ->orderBy('created_at', 'desc')
                ->get();

            $cargas->each(function (CargaHorariaDocente $carga): void {
                $carga->setAttribute('horario_display', $this->formatHorarioDisplay($carga));
                $carga->setAttribute('aula_display', $this->formatAulaDisplay($carga));
            });

            return response()->json([
                'success' => true,
                'data' => $cargas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener carga horaria del docente: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function porDocente(int $docenteId): JsonResponse
    {
        return $this->docente($docenteId);
    }

    private function formatHorarioDisplay(CargaHorariaDocente $carga): ?string
    {
        $horario = $carga->horario;

        if (! $horario) {
            return null;
        }

        $dia = mb_strtolower((string) $horario->dia);
        $inicio = (string) $horario->hora_inicio;
        $fin = (string) $horario->hora_fin;

        if (in_array($dia, ['lunes', 'miercoles', 'miércoles', 'viernes'], true)) {
            return "Lunes, Miércoles y Viernes {$inicio}-{$fin}";
        }

        if (in_array($dia, ['martes', 'jueves'], true)) {
            return "Martes y Jueves {$inicio}-{$fin}";
        }

        if (in_array($dia, ['sabado', 'sábado'], true)) {
            return "Sábado {$inicio}-{$fin}";
        }

        return "{$horario->dia} {$inicio}-{$fin}";
    }

    private function formatAulaDisplay(CargaHorariaDocente $carga): ?string
    {
        $aula = $carga->aula;

        if (! $aula) {
            return null;
        }

        $ubicacion = $aula->ubicacion ? " ({$aula->ubicacion})" : '';

        return "{$aula->nombre}{$ubicacion}";
    }
}
