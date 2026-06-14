<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequisitoRequest;
use App\Services\RequisitoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class RequisitoController extends Controller
{
    public function __construct(
        private readonly RequisitoService $requisitoService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(int $postulanteId): JsonResponse
    {
        try {
            $requisitos = $this->requisitoService->listForPostulante($postulanteId);

            return response()->json([
                'success' => true,
                'data' => $requisitos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar requisitos: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreRequisitoRequest $request, int $postulanteId): JsonResponse
    {
        try {
            $requisito = $this->requisitoService->create($postulanteId, $request->tipo_requisito, $request);

            return response()->json([
                'success' => true,
                'data' => $requisito,
                'message' => 'Requisito agregado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar requisito: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function toggle(\Illuminate\Http\Request $request, int $id): JsonResponse
    {
        try {
            $requisito = $this->requisitoService->toggle($id, $request);

            $estado = $requisito->cumplido ? 'cumplido' : 'no cumplido';

            return response()->json([
                'success' => true,
                'data' => $requisito,
                'message' => "Requisito marcado como {$estado}.",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del requisito: ' . $e->getMessage(),
            ], 500);
        }
    }
}
