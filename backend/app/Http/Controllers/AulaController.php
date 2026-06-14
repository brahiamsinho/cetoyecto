<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Http\Requests\StoreAulaRequest;
use App\Services\AulaService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AulaController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly AulaService $aulaService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $aulas = $this->aulaService->listAll();

            return response()->json([
                'success' => true,
                'data' => $aulas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar aulas: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreAulaRequest $request): JsonResponse
    {
        try {
            $aula = $this->aulaService->create($request->validated());

            $this->logBitacora(
                'CREAR',
                'Aulas',
                "Se creó el aula {$aula->nombre} ({$aula->codigo}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $aula,
                'message' => 'Aula creada correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear aula: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $aula = Aula::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $aula,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aula no encontrada.',
            ], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $aula = Aula::findOrFail($id);

            $codigo = is_string($request->input('codigo')) ? trim($request->input('codigo')) : $request->input('codigo');
            $nombre = is_string($request->input('nombre')) ? trim($request->input('nombre')) : $request->input('nombre');
            $ubicacion = is_string($request->input('ubicacion')) ? trim($request->input('ubicacion')) : $request->input('ubicacion');

            $request->validate([
                'codigo' => "required|string|unique:aulas,codigo,{$id}",
                'nombre' => 'required|string',
                'capacidad' => 'required|integer|min:1',
                'ubicacion' => 'nullable|string',
            ]);

            $aula = $this->aulaService->update($aula, [
                'codigo' => $codigo,
                'nombre' => $nombre,
                'capacidad' => $request->input('capacidad'),
                'ubicacion' => $ubicacion,
            ]);

            $this->logBitacora(
                'ACTUALIZAR',
                'Aulas',
                "Se actualizó el aula {$aula->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $aula,
                'message' => 'Aula actualizada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar aula: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $aula = Aula::findOrFail($id);
            $this->aulaService->delete($aula);

            $this->logBitacora(
                'ELIMINAR',
                'Aulas',
                "Se eliminó el aula {$aula->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Aula eliminada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar aula: ' . $e->getMessage(),
            ], 500);
        }
    }
}
