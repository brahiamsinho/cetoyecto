<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Nota;
use App\Models\Postulante;
use App\Http\Requests\StoreNotaRequest;
use App\Services\NotaService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NotaController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly NotaService $notaService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($postulanteId);

            $notas = Nota::with('materia')
                ->where('postulante_id', $postulanteId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar notas: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreNotaRequest $request, int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($postulanteId);

            // Verificar que el postulante haya realizado el pago
            $pago = \App\Models\Pago::where('postulante_id', $postulanteId)
                ->where('estado', 'pagado')
                ->first();

            if (!$pago) {
                return response()->json([
                    'success' => false,
                    'message' => 'El postulante no ha realizado el pago. No se pueden registrar notas.',
                ], 422);
            }

            $promedio = $this->notaService->calcularPromedio(
                (float) $request->nota1,
                (float) $request->nota2,
                (float) $request->nota3
            );

            $nota = Nota::updateOrCreate(
                [
                    'postulante_id' => $postulanteId,
                    'materia_id' => $request->materia_id,
                ],
                [
                    'nota1' => $request->nota1,
                    'nota2' => $request->nota2,
                    'nota3' => $request->nota3,
                    'promedio' => $promedio,
                ]
            );

            $this->logBitacora(
                'CREAR',
                'Notas',
                "Se registraron notas para postulante {$postulante->nombres} {$postulante->apellidos} - Promedio: {$promedio}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $nota->load('materia'),
                'message' => 'Notas registradas correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar notas: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'nota1' => 'required|numeric|min:0|max:100',
                'nota2' => 'required|numeric|min:0|max:100',
                'nota3' => 'required|numeric|min:0|max:100',
            ]);

            $nota = Nota::findOrFail($id);

            $promedio = $this->notaService->calcularPromedio(
                (float) $request->nota1,
                (float) $request->nota2,
                (float) $request->nota3
            );

            $nota->update([
                'nota1' => $request->nota1,
                'nota2' => $request->nota2,
                'nota3' => $request->nota3,
                'promedio' => $promedio,
            ]);

            $this->logBitacora(
                'ACTUALIZAR',
                'Notas',
                "Se actualizó nota ID {$nota->id} - Nuevo promedio: {$promedio}.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $nota->fresh()->load('materia'),
                'message' => 'Notas actualizadas correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar notas: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function promedios(int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::with('notas.materia')->findOrFail($postulanteId);

            $notasPorMateria = $postulante->notas->groupBy('materia_id')->map(function ($notas, $materiaId) {
                $materia = $notas->first()->materia;

                return [
                    'materia_id' => $materiaId,
                    'materia_nombre' => $materia->nombre,
                    'notas' => $notas,
                    'promedio_materia' => round($notas->avg('promedio'), 2),
                ];
            });

            $promediosMateria = $notasPorMateria->pluck('promedio_materia');

            $promedioFinal = $promediosMateria->isNotEmpty()
                ? round($promediosMateria->avg(), 2)
                : 0;

            $estado = $this->notaService->determinarEstado($promedioFinal);

            return response()->json([
                'success' => true,
                'data' => [
                    'postulante' => [
                        'id' => $postulante->id,
                        'nombres' => $postulante->nombres,
                        'apellidos' => $postulante->apellidos,
                        'ci' => $postulante->ci,
                    ],
                    'notas_por_materia' => $notasPorMateria,
                    'promedio_final' => $promedioFinal,
                    'estado' => $estado,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular promedios: ' . $e->getMessage(),
            ], 500);
        }
    }
}
