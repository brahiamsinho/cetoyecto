<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Grupo;
use App\Http\Requests\GenerarGruposRequest;
use App\Services\GrupoService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class GrupoController extends Controller
{
    use HasBitacora;

    public function __construct(
        private readonly GrupoService $grupoService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $grupos = $request->boolean('visible')
                ? $this->grupoService->gruposVisibles()
                : $this->grupoService->prepararGrupos(
                    Grupo::with('materias')
                        ->withCount('postulantes as estudiantes_count')
                        ->orderBy('nombre')
                        ->get()
                );

            return response()->json([
                'success' => true,
                'data' => $grupos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar grupos: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generarGrupos(GenerarGruposRequest $request): JsonResponse
    {
        try {
            $grupos = $this->grupoService->generarGrupos($request);

            $this->logBitacora(
                'GENERAR',
                'Grupos',
                'Se generaron grupos automáticamente para la gestión actual.',
                $request
            );

            $gruposConConteo = $this->grupoService->gruposVisibles();

            return response()->json([
                'success' => true,
                'data' => $gruposConConteo,
                'message' => 'Grupos generados correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar grupos: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generar(GenerarGruposRequest $request): JsonResponse
    {
        return $this->generarGrupos($request);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $grupos = Grupo::with([
                'materias',
                'postulantes',
                'cargasHorarias.docente',
                'cargasHorarias.aula',
                'cargasHorarias.horario',
            ])
                ->withCount('postulantes as estudiantes_count')
                ->orderBy('nombre')
                ->get();

            $grupo = $this->grupoService->prepararGrupos($grupos)->firstWhere('id', $id)
                ?? throw new \RuntimeException('Grupo no encontrado.');

            return response()->json([
                'success' => true,
                'data' => $grupo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado.',
            ], 404);
        }
    }

    public function estudiantes(int $id): JsonResponse
    {
        try {
            $grupo = Grupo::findOrFail($id);

            $estudiantes = $grupo->postulantes()->with([
                'carreraAsignada',
                'notas.materia',
            ])->get();

            return response()->json([
                'success' => true,
                'data' => $estudiantes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar estudiantes del grupo: ' . $e->getMessage(),
            ], 500);
        }
    }

}
