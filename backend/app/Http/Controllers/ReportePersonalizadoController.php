<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Services\ReporteExporterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ReportePersonalizadoController extends Controller
{
    public function __construct(
        private readonly GeminiService $geminiService,
        private readonly ReporteExporterService $exporterService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Genera un reporte personalizado usando Gemini.
     */
    public function generar(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'prompt' => 'required|string|min:10|max:2000',
                'formatos' => 'required|array|min:1|max:3',
                'formatos.*' => 'in:html,pdf,excel',
            ]);

            $prompt = $request->get('prompt');
            $formatos = $request->get('formatos', ['html']);

            // Obtener contexto del sistema
            $contexto = $this->geminiService->obtenerContextoSistema();

            // Generar reporte con Gemini
            $resultado = $this->geminiService->generarReporte($prompt, $contexto);

            if (isset($resultado['error']) && $resultado['error']) {
                return response()->json([
                    'success' => false,
                    'message' => $resultado['message'],
                ], 400);
            }

            // Generar archivos según los formatos solicitados
            $archivos = [];
            $titulo = $resultado['titulo'] ?? 'Reporte Personalizado';
            $html = $resultado['html'] ?? '';
            $datosJson = $resultado['datos_json'] ?? [];

            foreach ($formatos as $formato) {
                switch ($formato) {
                    case 'pdf':
                        $archivo = $this->exporterService->generarPDF($titulo, $html);
                        if ($archivo) {
                            $archivos[] = [
                                'formato' => 'pdf',
                                'url' => $archivo['url'],
                                'nombre' => $archivo['nombre'],
                            ];
                        }
                        break;
                    case 'excel':
                        $archivo = $this->exporterService->generarExcel($titulo, $datosJson, $html);
                        if ($archivo) {
                            $archivos[] = [
                                'formato' => 'excel',
                                'url' => $archivo['url'],
                                'nombre' => $archivo['nombre'],
                            ];
                        }
                        break;
                    case 'html':
                    default:
                        $archivos[] = [
                            'formato' => 'html',
                            'contenido' => $html,
                        ];
                        break;
                }
            }

            // Registrar en bitácora
            log_bitacora(
                'GENERAR_REPORTE',
                'Reportes',
                "Se generó reporte personalizado con Gemini: '{$titulo}' en formatos: " . implode(', ', $formatos),
                null,
                $request
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'titulo' => $titulo,
                    'html' => $html,
                    'datos_json' => $datosJson,
                    'archivos' => $archivos,
                ],
                'message' => 'Reporte generado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Descarga un archivo de reporte generado.
     */
    public function descargar(Request $request, string $nombreArchivo)
    {
        try {
            $path = storage_path('app/reportes/' . $nombreArchivo);
            
            if (!file_exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo no encontrado.',
                ], 404);
            }

            $extension = pathinfo($nombreArchivo, PATHINFO_EXTENSION);
            $mimeType = match ($extension) {
                'pdf' => 'application/pdf',
                'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                default => 'application/octet-stream',
            };

            return response()->file($path, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'attachment; filename="' . $nombreArchivo . '"',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar archivo: ' . $e->getMessage(),
            ], 500);
        }
    }
}
