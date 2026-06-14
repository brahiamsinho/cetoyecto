<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Services\ReporteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ReporteController extends Controller
{
    public function __construct(
        private readonly ReporteService $reporteService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function postulantes(Request $request): JsonResponse
    {
        try {
            $estadoPromedio = $request->get('estado_promedio');
            $data = $this->reporteService->postulantesReport($estadoPromedio);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function aprobados(): JsonResponse
    {
        try {
            $data = $this->reporteService->aprobadosReport();

            return response()->json([
                'success' => true,
                'data' => $data['data'],
                'total' => $data['total'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function reprobados(): JsonResponse
    {
        try {
            $data = $this->reporteService->reprobadosReport();

            return response()->json([
                'success' => true,
                'data' => $data['data'],
                'total' => $data['total'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function promedios(): JsonResponse
    {
        try {
            $data = $this->reporteService->promediosReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function grupos(): JsonResponse
    {
        try {
            $data = $this->reporteService->gruposReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function estadisticasMateria(): JsonResponse
    {
        try {
            $data = $this->reporteService->estadisticasMateriaReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function docentesGrupos(): JsonResponse
    {
        try {
            $data = $this->reporteService->docentesGruposReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function gruposMasAprobados(): JsonResponse
    {
        try {
            $data = $this->reporteService->gruposMasAprobadosReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function asistenciaDocente(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'docente_id' => 'nullable|exists:docentes,id',
                'fecha_desde' => 'nullable|date',
                'fecha_hasta' => 'nullable|date',
                'desde' => 'nullable|date',
                'hasta' => 'nullable|date',
            ]);

            $data = $this->reporteService->asistenciaDocenteReport($request);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cuposCarrera(): JsonResponse
    {
        try {
            $data = $this->reporteService->cuposCarreraReport();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }
}
