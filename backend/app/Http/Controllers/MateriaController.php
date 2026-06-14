<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Http\Requests\StoreMateriaRequest;
use App\Services\MateriaService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MateriaController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly MateriaService $materiaService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $materias = $this->materiaService->listAll();

            return response()->json([
                'success' => true,
                'data' => $materias,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar materias: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreMateriaRequest $request): JsonResponse
    {
        try {
            $materia = $this->materiaService->create($request->validated());

            $this->logBitacora(
                'CREAR',
                'Materias',
                "Se creó la materia {$materia->nombre} ({$materia->codigo}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $materia,
                'message' => 'Materia creada correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear materia: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $materia = Materia::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $materia,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Materia no encontrada.',
            ], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $materia = Materia::findOrFail($id);

            $request->validate([
                'codigo' => "required|string|unique:materias,codigo,{$id}",
                'nombre' => "required|string|unique:materias,nombre,{$id}",
                'descripcion' => 'nullable|string',
            ]);

            $materia = $this->materiaService->update($materia, $request->all());

            $this->logBitacora(
                'ACTUALIZAR',
                'Materias',
                "Se actualizó la materia {$materia->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $materia,
                'message' => 'Materia actualizada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar materia: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $materia = Materia::findOrFail($id);
            $this->materiaService->delete($materia);

            $this->logBitacora(
                'ELIMINAR',
                'Materias',
                "Se eliminó la materia {$materia->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Materia eliminada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar materia: ' . $e->getMessage(),
            ], 500);
        }
    }
}
