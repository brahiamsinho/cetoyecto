<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ReporteIa;
use App\Services\GeminiService;
use App\Services\ReporteExporterService;
use App\Traits\HasBitacora;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReporteIaController extends Controller
{
    use HasBitacora;

    public function __construct(
        private readonly GeminiService $geminiService,
        private readonly ReporteExporterService $exporterService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Genera un reporte personalizado con IA.
     */
    public function generar(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $prompt = $request->input('prompt');

        try {
            // Obtener contexto del sistema
            $contexto = $this->geminiService->obtenerContextoSistema();

            // Generar reporte con Gemini
            $resultado = $this->geminiService->generarReporte($prompt, $contexto);

            if ($resultado['error'] ?? false) {
                return response()->json([
                    'success' => false,
                    'message' => $resultado['message'] ?? 'Error al generar reporte.',
                ], 500);
            }

            // Guardar en base de datos
            $reporteIa = ReporteIa::create([
                'user_id' => $request->user()->id,
                'prompt_usuario' => $prompt,
                'titulo' => $resultado['titulo'] ?? 'Reporte Personalizado',
                'resumen' => $resultado['resumen'] ?? '',
                'columnas' => $resultado['columnas'] ?? [],
                'filas' => $resultado['filas'] ?? [],
                'conclusiones' => $resultado['conclusiones'] ?? [],
            ]);

            // Log en bitácora
            $this->logBitacora(
                'GENERÓ REPORTE IA',
                'Reportes',
                "Se generó reporte IA: {$reporteIa->titulo}",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $reporteIa->id,
                    'titulo' => $reporteIa->titulo,
                    'resumen' => $reporteIa->resumen,
                    'columnas' => $reporteIa->columnas,
                    'filas' => $reporteIa->filas,
                    'conclusiones' => $reporteIa->conclusiones,
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
     * Exporta un reporte IA a Excel.
     */
    public function exportarExcel(Request $request, int $id)
    {
        try {
            $reporte = ReporteIa::findOrFail($id);

            // Verificar que el usuario sea el dueño o admin
            if ($reporte->user_id !== $request->user()->id && !$request->user()->hasRole('CPD')) {
                return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
            }

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($reporte->titulo ?? 'Reporte IA');

            // Título
            $sheet->setCellValue('A1', $reporte->titulo ?? 'Reporte Personalizado');
            $sheet->mergeCells('A1:D1');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

            // Resumen
            $sheet->setCellValue('A3', 'Resumen:');
            $sheet->getStyle('A3')->getFont()->setBold(true);
            $sheet->setCellValue('A4', $reporte->resumen ?? 'Sin resumen.');
            $sheet->mergeCells('A4:D4');

            // Tabla de datos
            if (!empty($reporte->columnas) && !empty($reporte->filas)) {
                $headerRow = 6;
                foreach ($reporte->columnas as $colIndex => $colName) {
                    $cell = $this->getColumnLetter($colIndex + 1) . $headerRow;
                    $sheet->setCellValue($cell, $colName);
                    $sheet->getStyle($cell)->getFont()->setBold(true);
                    $sheet->getStyle($cell)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                    $sheet->getStyle($cell)->getFill()->getStartColor()->setARGB('FF2563EB');
                    $sheet->getStyle($cell)->getFont()->getColor()->setARGB('FFFFFFFF');
                }

                $dataRow = 7;
                foreach ($reporte->filas as $fila) {
                    foreach ($fila as $colIndex => $valor) {
                        $cell = $this->getColumnLetter($colIndex + 1) . $dataRow;
                        $sheet->setCellValue($cell, $valor ?? '');
                    }
                    $dataRow++;
                }

                // Auto-size
                foreach (range(1, count($reporte->columnas)) as $colIndex) {
                    $sheet->getColumnDimension($this->getColumnLetter($colIndex))->setAutoSize(true);
                }
            } else {
                $sheet->setCellValue('A6', 'Sin datos disponibles.');
                $sheet->getStyle('A6')->getFont()->setItalic(true);
            }

            // Conclusiones
            if (!empty($reporte->conclusiones)) {
                $conclusionRow = !empty($reporte->filas) ? count($reporte->filas) + 9 : 8;
                $sheet->setCellValue('A' . $conclusionRow, 'Conclusiones:');
                $sheet->getStyle('A' . $conclusionRow)->getFont()->setBold(true);
                
                foreach ($reporte->conclusiones as $i => $conclusion) {
                    $sheet->setCellValue('A' . ($conclusionRow + 1 + $i), ($i + 1) . '. ' . $conclusion);
                }
            }

            // Generar archivo
            $writer = new Xlsx($spreadsheet);
            $fileName = "reporte_ia_{$reporte->id}.xlsx";
            $tempFile = tempnam(sys_get_temp_dir(), 'xlsx_') . '.xlsx';
            $writer->save($tempFile);

            // Log en bitácora
            $this->logBitacora(
                'DESCARGÓ REPORTE IA EN EXCEL',
                'Reportes',
                "Se descargó reporte IA en Excel: {$reporte->titulo}",
                $request
            );

            return response()->download($tempFile, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar Excel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exporta un reporte IA a PDF.
     */
    public function exportarPdf(Request $request, int $id)
    {
        try {
            $reporte = ReporteIa::findOrFail($id);

            // Verificar que el usuario sea el dueño o admin
            if ($reporte->user_id !== $request->user()->id && !$request->user()->hasRole('CPD')) {
                return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
            }

            // Construir HTML
            $html = $this->buildPdfHtml($reporte);

            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true]);

            $fileName = "reporte_ia_{$reporte->id}.pdf";

            // Log en bitácora
            $this->logBitacora(
                'DESCARGÓ REPORTE IA EN PDF',
                'Reportes',
                "Se descargó reporte IA en PDF: {$reporte->titulo}",
                $request
            );

            return $pdf->download($fileName);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Construye el HTML para el PDF.
     */
    private function buildPdfHtml(ReporteIa $reporte): string
    {
        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
        $html .= 'body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }';
        $html .= 'h1 { text-align: center; color: #1e293b; font-size: 18px; margin-bottom: 20px; }';
        $html .= 'h2 { color: #2563eb; font-size: 14px; margin-top: 20px; margin-bottom: 10px; }';
        $html .= 'p { margin-bottom: 10px; line-height: 1.5; }';
        $html .= 'table { width: 100%; border-collapse: collapse; margin: 15px 0; }';
        $html .= 'th { background-color: #2563eb; color: white; padding: 8px; text-align: left; font-size: 10px; }';
        $html .= 'td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }';
        $html .= 'tr:nth-child(even) { background-color: #f8fafc; }';
        $html .= '.resumen { background-color: #f0f9ff; padding: 12px; border-left: 4px solid #2563eb; margin: 15px 0; }';
        $html .= '.conclusiones { background-color: #f0fdf4; padding: 12px; border-left: 4px solid #16a34a; margin: 15px 0; }';
        $html .= '.footer { text-align: center; margin-top: 30px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }';
        $html .= '</style></head><body>';

        // Título
        $html .= '<h1>' . htmlspecialchars($reporte->titulo ?? 'Reporte Personalizado') . '</h1>';

        // Resumen
        if ($reporte->resumen) {
            $html .= '<h2>Resumen</h2>';
            $html .= '<div class="resumen"><p>' . nl2br(htmlspecialchars($reporte->resumen)) . '</p></div>';
        }

        // Tabla de datos
        if (!empty($reporte->columnas) && !empty($reporte->filas)) {
            $html .= '<h2>Datos</h2>';
            $html .= '<table><thead><tr>';
            foreach ($reporte->columnas as $col) {
                $html .= '<th>' . htmlspecialchars($col) . '</th>';
            }
            $html .= '</tr></thead><tbody>';
            foreach ($reporte->filas as $fila) {
                $html .= '<tr>';
                foreach ($fila as $valor) {
                    $html .= '<td>' . htmlspecialchars((string) ($valor ?? '')) . '</td>';
                }
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p style="text-align: center; color: #64748b; font-style: italic; padding: 20px;">Sin datos disponibles.</p>';
        }

        // Conclusiones
        if (!empty($reporte->conclusiones)) {
            $html .= '<h2>Conclusiones</h2>';
            $html .= '<div class="conclusiones">';
            foreach ($reporte->conclusiones as $i => $conclusion) {
                $html .= '<p>' . ($i + 1) . '. ' . htmlspecialchars($conclusion) . '</p>';
            }
            $html .= '</div>';
        }

        // Footer
        $usuario = $reporte->user?->name ?? 'Desconocido';
        $fecha = $reporte->created_at?->format('d/m/Y H:i') ?? date('d/m/Y H:i');
        $html .= '<div class="footer">';
        $html .= 'Generado por: ' . htmlspecialchars($usuario) . ' | Fecha: ' . $fecha;
        $html .= '<br>Sistema CUP-FICCT - Reporte generado con IA';
        $html .= '</div>';

        $html .= '</body></html>';

        return $html;
    }

    /**
     * Obtiene el historial de reportes IA del usuario.
     */
    public function historial(Request $request): JsonResponse
    {
        $reportes = ReporteIa::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'titulo' => $r->titulo,
                    'prompt' => substr($r->prompt_usuario, 0, 100) . (strlen($r->prompt_usuario) > 100 ? '...' : ''),
                    'fecha' => $r->created_at->format('d/m/Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $reportes,
        ]);
    }

    /**
     * Get column letter from index.
     */
    private function getColumnLetter(int $index): string
    {
        $letter = '';
        while ($index > 0) {
            $remainder = ($index - 1) % 26;
            $letter = chr(65 + $remainder) . $letter;
            $index = (int) (($index - 1) / 26);
        }
        return $letter;
    }
}
