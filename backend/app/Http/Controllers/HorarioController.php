<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Http\Requests\StoreHorarioRequest;
use App\Services\HorarioService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class HorarioController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly HorarioService $horarioService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $horarios = $this->horarioService->listAll();

            return response()->json([
                'success' => true,
                'data' => $horarios,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar horarios: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreHorarioRequest $request): JsonResponse
    {
        try {
            $horario = $this->horarioService->create($request->validated());

            $this->logBitacora(
                'CREAR',
                'Horarios',
                "Se creó el horario {$horario->dia} {$horario->hora_inicio}-{$horario->hora_fin}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $horario,
                'message' => 'Horario creado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear horario: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $horario = Horario::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $horario,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado.',
            ], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $horario = Horario::findOrFail($id);

            $request->validate([
                'dia' => 'required|string',
                'hora_inicio' => ['required', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
                'hora_fin' => ['required', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', 'after:hora_inicio'],
                'turno' => 'required|string',
            ], [
                'dia.required' => 'El día es obligatorio.',
                'hora_inicio.required' => 'La hora de inicio es obligatoria.',
                'hora_inicio.regex' => 'La hora de inicio debe tener el formato HH:MM (ej: 07:00 o 14:30).',
                'hora_fin.required' => 'La hora de fin es obligatoria.',
                'hora_fin.regex' => 'La hora de fin debe tener el formato HH:MM (ej: 07:00 o 14:30).',
                'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
                'turno.required' => 'El turno es obligatorio.',
            ]);

            $horario = $this->horarioService->update($horario, $request->all());

            $this->logBitacora(
                'ACTUALIZAR',
                'Horarios',
                "Se actualizó el horario {$horario->dia} {$horario->hora_inicio}-{$horario->hora_fin}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $horario,
                'message' => 'Horario actualizado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar horario: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $horario = Horario::findOrFail($id);
            $this->horarioService->delete($horario);

            $this->logBitacora(
                'ELIMINAR',
                'Horarios',
                "Se eliminó el horario {$horario->dia} {$horario->hora_inicio}-{$horario->hora_fin}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Horario eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar horario: ' . $e->getMessage(),
            ], 500);
        }
    }
}
