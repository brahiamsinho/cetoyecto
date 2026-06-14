<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Http\Requests\StoreCarreraRequest;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CarreraController extends Controller
{
    use HasBitacora;
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Carrera::orderBy('nombre');

            if (!$request->has('all') || !$request->boolean('all')) {
                $query->where('activo', true);
            }

            $carreras = $query->get();

            return response()->json([
                'success' => true,
                'data' => $carreras,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar carreras: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreCarreraRequest $request): JsonResponse
    {
        try {
            $carrera = Carrera::create($request->validated());

            $this->logBitacora(
                'CREAR',
                'Carreras',
                "Se creó la carrera {$carrera->nombre} ({$carrera->codigo}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $carrera,
                'message' => 'Carrera creada correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear carrera: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $carrera = Carrera::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $carrera,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Carrera no encontrada.',
            ], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $carrera = Carrera::findOrFail($id);

            $request->validate([
                'codigo' => "required|string|unique:carreras,codigo,{$id}",
                'nombre' => "required|string|unique:carreras,nombre,{$id}",
                'description' => 'nullable|string',
                'cupo_maximo' => 'required|integer|min:1',
            ]);

            $carrera->update($request->all());

            $this->logBitacora(
                'ACTUALIZAR',
                'Carreras',
                "Se actualizó la carrera {$carrera->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $carrera->fresh(),
                'message' => 'Carrera actualizada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar carrera: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $carrera = Carrera::findOrFail($id);
            $carrera->update(['activo' => false]);

            $this->logBitacora(
                'DESACTIVAR',
                'Carreras',
                "Se desactivó la carrera {$carrera->nombre}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Carrera desactivada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar carrera: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cupos(): JsonResponse
    {
        try {
            $carreras = Carrera::where('activo', true)->get()->map(function ($carrera) {
                return [
                    'id' => $carrera->id,
                    'codigo' => $carrera->codigo,
                    'nombre' => $carrera->nombre,
                    'cupo_maximo' => $carrera->cupo_maximo,
                    'cupo_actual' => $carrera->cupo_actual,
                    'cupo_disponible' => $carrera->cupo_disponible,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $carreras,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener cupos: ' . $e->getMessage(),
            ], 500);
        }
    }
}
