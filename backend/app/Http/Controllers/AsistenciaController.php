<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreAsistenciaRequest;
use App\Services\AsistenciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AsistenciaController extends Controller
{
    public function __construct(
        private readonly AsistenciaService $asistenciaService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $asistencias = $this->asistenciaService->listFiltered($request);

            return response()->json([
                'success' => true,
                'data' => $asistencias,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar asistencias: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreAsistenciaRequest $request): JsonResponse
    {
        try {
            $asistencia = $this->asistenciaService->registerAsistencia($request->validated(), $request);

            return response()->json([
                'success' => true,
                'data' => $asistencia,
                'message' => 'Asistencia registrada correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar asistencia: ' . $e->getMessage(),
            ], 500);
        }
    }
}
