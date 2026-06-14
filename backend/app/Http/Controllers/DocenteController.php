<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CargaHorariaDocente;
use App\Models\Docente;
use App\Http\Requests\StoreDocenteRequest;
use App\Services\DocenteService;
use App\Services\UserService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DocenteController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly DocenteService $docenteService,
        private readonly UserService $userService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $docentes = Docente::withCount('cargasHorarias as grupos_asignados_count')
                ->orderBy('apellidos')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $docentes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar docentes: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreDocenteRequest $request): JsonResponse
    {
        try {
            $docente = DB::transaction(function () use ($request) {
                $docente = Docente::create($request->validated());
                $this->userService->syncDocenteAccount($docente);

                return $docente->fresh();
            });

            $this->logBitacora(
                'CREAR',
                'Docentes',
                "Se registró el docente {$docente->nombres} {$docente->apellidos}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $docente,
                'message' => 'Docente registrado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar docente: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $docente = Docente::with('cargasHorarias.grupo', 'cargasHorarias.materia', 'cargasHorarias.aula', 'cargasHorarias.horario')
                ->withCount('cargasHorarias as grupos_asignados_count')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $docente,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'ci' => "required|string|unique:docentes,ci,{$id}",
                'nombres' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'email' => "required|email|unique:docentes,email,{$id}",
                'telefono' => 'nullable|string',
                'profesion' => 'required|string',
                'maestria' => 'boolean',
                'diplomado_educacion_superior' => 'boolean',
            ], [
                'ci.required' => 'El campo CI es obligatorio.',
                'ci.unique' => 'El CI ya está registrado.',
                'nombres.required' => 'El campo nombres es obligatorio.',
                'apellidos.required' => 'El campo apellidos es obligatorio.',
                'email.required' => 'El campo email es obligatorio.',
                'email.unique' => 'El email ya está registrado.',
                'profesion.required' => 'La profesión es obligatoria.',
            ]);

            $docente = DB::transaction(function () use ($id, $validated) {
                $docente = Docente::findOrFail($id);
                $docente->update($validated);
                $this->userService->syncDocenteAccount($docente->fresh());

                return $docente->fresh();
            });

            $this->logBitacora(
                'ACTUALIZAR',
                'Docentes',
                "Se actualizó el docente {$docente->nombres} {$docente->apellidos}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $docente->fresh(),
                'message' => 'Docente actualizado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar docente: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $docente = Docente::findOrFail($id);
            $docente->delete();

            $this->logBitacora(
                'ELIMINAR',
                'Docentes',
                "Se eliminó el docente {$docente->nombres} {$docente->apellidos}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Docente eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar docente: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function validarRequisitos(Request $request, int $id): JsonResponse
    {
        try {
            $docente = Docente::findOrFail($id);

            $resultado = $this->docenteService->validarRequisitos($docente);

            $this->logBitacora(
                'VALIDAR_REQUISITOS',
                'Docentes',
                "Se validaron requisitos del docente {$docente->nombres} {$docente->apellidos}. Contratado: " . ($resultado['todos_cumplidos'] ? 'Sí' : 'No'),
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $resultado,
                'message' => $resultado['todos_cumplidos']
                    ? 'El docente cumple con todos los requisitos y ha sido contratado.'
                    : 'El docente no cumple con todos los requisitos.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al validar requisitos: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function asignarGrupo(Request $request, int $id): JsonResponse
    {
        try {
            $docente = Docente::findOrFail($id);

            $request->validate([
                'grupo_id' => 'required|exists:grupos,id',
                'materia_id' => 'required|exists:materias,id',
                'aula_id' => 'required|exists:aulas,id',
                'horario_id' => 'required|exists:horarios,id',
            ]);

            $gruposAsignados = $this->docenteService->contarGruposAsignados($docente);

            if ($gruposAsignados >= 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'El docente ya tiene asignados 4 grupos (máximo permitido).',
                ], 422);
            }

            if ($this->docenteService->verificarConflictoHorario($docente, $request->horario_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El docente ya tiene una asignación en este horario.',
                ], 422);
            }

            if ($this->docenteService->verificarConflictoAula($request->aula_id, $request->horario_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El aula ya está ocupada en este horario.',
                ], 422);
            }

            $carga = CargaHorariaDocente::create([
                'docente_id' => $docente->id,
                'grupo_id' => $request->grupo_id,
                'materia_id' => $request->materia_id,
                'aula_id' => $request->aula_id,
                'horario_id' => $request->horario_id,
            ]);

            $this->logBitacora(
                'ASIGNAR_GRUPO',
                'Docentes',
                "Se asignó el docente {$docente->nombres} {$docente->apellidos} al grupo ID {$request->grupo_id}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $carga->load(['grupo', 'materia', 'aula', 'horario']),
                'message' => 'Grupo asignado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asignar grupo: ' . $e->getMessage(),
            ], 500);
        }
    }
}
