<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReporteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReporteExportController extends Controller
{
    public function __construct(
        private readonly ReporteService $reporteService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Map of report keys to their configuration.
     */
    private function getReportConfig(): array
    {
        return [
            'postulantes' => [
                'title' => 'Reporte de Postulantes',
                'columns' => ['CI', 'Nombres', 'Apellidos', 'Carrera 1ra Opción', 'Carrera 2da Opción', 'Carrera Asignada', 'Gestión', 'Estado Pago', 'Promedio Final', 'Estado'],
                'data_method' => 'getPostulantesData',
            ],
            'aprobados' => [
                'title' => 'Postulantes Aprobados',
                'columns' => ['CI', 'Nombres', 'Apellidos', 'Carrera Asignada', 'Promedio Final', 'Estado'],
                'data_method' => 'getAprobadosData',
            ],
            'reprobados' => [
                'title' => 'Postulantes Reprobados',
                'columns' => ['CI', 'Nombres', 'Apellidos', 'Carrera Asignada', 'Promedio Final', 'Estado'],
                'data_method' => 'getReprobadosData',
            ],
            'promedios' => [
                'title' => 'Promedios Generales',
                'columns' => ['CI', 'Nombres', 'Apellidos', 'Carrera Asignada', 'Promedio Final', 'Estado'],
                'data_method' => 'getPromediosData',
            ],
            'grupos' => [
                'title' => 'Lista de Grupos',
                'columns' => ['Código', 'Nombre', 'Materias', 'Estudiantes'],
                'data_method' => 'getGruposData',
            ],
            'estadisticas-materia' => [
                'title' => 'Estadísticas por Materia',
                'columns' => ['Materia', 'Código', 'Total Estudiantes', 'Promedio General', 'Nota Máxima', 'Nota Mínima'],
                'data_method' => 'getEstadisticasMateriaData',
            ],
            'docentes-grupos' => [
                'title' => 'Docentes por Grupos',
                'columns' => ['Nombres', 'Apellidos', 'Profesión', 'Grupos Asignados', 'Total Grupos'],
                'data_method' => 'getDocentesGruposData',
            ],
            'grupos-mas-aprobados' => [
                'title' => 'Grupos más Aprobados',
                'columns' => ['Grupo', 'Materia', 'Total Estudiantes', 'Aprobados', 'Reprobados', '% Aprobación'],
                'data_method' => 'getGruposMasAprobadosData',
            ],
            'asistencia-docente' => [
                'title' => 'Asistencia Docente',
                'columns' => ['Docente', 'Grupo', 'Materia', 'Fecha', 'Horario', 'Estado', 'Observaciones'],
                'data_method' => 'getAsistenciaDocenteData',
            ],
            'cupos-carrera' => [
                'title' => 'Cupos por Carrera',
                'columns' => ['Código', 'Carrera', 'Cupo Máximo', 'Cupo Actual', 'Cupo Disponible', '% Ocupación'],
                'data_method' => 'getCuposCarreraData',
            ],
        ];
    }

    /**
     * Export a report to Excel.
     */
    public function exportExcel(Request $request, string $reportKey)
    {
        $config = $this->getReportConfig();

        if (!isset($config[$reportKey])) {
            return response()->json(['success' => false, 'message' => 'Reporte no encontrado.'], 404);
        }

        try {
            $reportConfig = $config[$reportKey];
            $data = $this->{$reportConfig['data_method']}($request);
            $columns = $reportConfig['columns'];
            $title = $reportConfig['title'];

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($title);

            // Title row
            $sheet->setCellValue('A1', $title);
            $sheet->mergeCells('A1:' . $this->getColumnLetter(count($columns)) . '1');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            $sheet->getStyle('A1')->getAlignment()->setHorizontal('center');

            // Header row
            $headerRow = 3;
            foreach ($columns as $colIndex => $colName) {
                $cell = $this->getColumnLetter($colIndex + 1) . $headerRow;
                $sheet->setCellValue($cell, $colName);
                $sheet->getStyle($cell)->getFont()->setBold(true);
                $sheet->getStyle($cell)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                $sheet->getStyle($cell)->getFill()->getStartColor()->setARGB('FF2563EB');
                $sheet->getStyle($cell)->getFont()->getColor()->setARGB('FFFFFFFF');
            }

            // Data rows
            $dataRow = 4;
            foreach ($data as $row) {
                foreach ($row as $colIndex => $value) {
                    $cell = $this->getColumnLetter($colIndex + 1) . $dataRow;
                    $sheet->setCellValue($cell, $value ?? '');
                }
                $dataRow++;
            }

            // Auto-size columns
            foreach (range(0, count($columns) - 1) as $colIndex) {
                $letter = $this->getColumnLetter($colIndex + 1);
                $sheet->getColumnDimension($letter)->setAutoSize(true);
            }

            // If no data, add message
            if (empty($data)) {
                $sheet->setCellValue('A' . ($dataRow), 'Sin datos disponibles.');
                $sheet->getStyle('A' . ($dataRow))->getFont()->setItalic(true);
            }

            // Generate file
            $writer = new Xlsx($spreadsheet);
            $fileName = "reporte_{$reportKey}.xlsx";
            $tempFile = tempnam(sys_get_temp_dir(), 'xlsx_') . '.xlsx';
            $writer->save($tempFile);

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
     * Export a report to PDF.
     */
    public function exportPdf(Request $request, string $reportKey)
    {
        $config = $this->getReportConfig();

        if (!isset($config[$reportKey])) {
            return response()->json(['success' => false, 'message' => 'Reporte no encontrado.'], 404);
        }

        try {
            $reportConfig = $config[$reportKey];
            $data = $this->{$reportConfig['data_method']}($request);
            $columns = $reportConfig['columns'];
            $title = $reportConfig['title'];

            $html = $this->buildPdfHtml($title, $columns, $data);

            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');
            $pdf->setOptions(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true]);

            $fileName = "reporte_{$reportKey}.pdf";

            return $pdf->download($fileName);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build HTML for PDF generation.
     */
    private function buildPdfHtml(string $title, array $columns, array $data): string
    {
        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
        $html .= 'body { font-family: DejaVu Sans, sans-serif; font-size: 10px; }';
        $html .= 'h1 { text-align: center; color: #1e293b; font-size: 16px; margin-bottom: 16px; }';
        $html .= 'table { width: 100%; border-collapse: collapse; }';
        $html .= 'th { background-color: #2563eb; color: white; padding: 6px 8px; text-align: left; font-size: 9px; }';
        $html .= 'td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 9px; }';
        $html .= 'tr:nth-child(even) { background-color: #f8fafc; }';
        $html .= '.no-data { text-align: center; color: #64748b; font-style: italic; padding: 20px; }';
        $html .= '.footer { text-align: center; margin-top: 16px; font-size: 8px; color: #94a3b8; }';
        $html .= '</style></head><body>';
        $html .= '<h1>' . htmlspecialchars($title) . '</h1>';
        $html .= '<table><thead><tr>';
        foreach ($columns as $col) {
            $html .= '<th>' . htmlspecialchars($col) . '</th>';
        }
        $html .= '</tr></thead><tbody>';

        if (empty($data)) {
            $html .= '<tr><td colspan="' . count($columns) . '" class="no-data">Sin datos disponibles.</td></tr>';
        } else {
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $value) {
                    $html .= '<td>' . htmlspecialchars((string) ($value ?? '')) . '</td>';
                }
                $html .= '</tr>';
            }
        }

        $html .= '</tbody></table>';
        $html .= '<div class="footer">Generado el ' . date('d/m/Y H:i') . ' - Sistema CUP-FICCT</div>';
        $html .= '</body></html>';

        return $html;
    }

    /**
     * Get column letter from index (1=A, 2=B, 27=AA, etc.)
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

    // ─── Data extraction methods ────────────────────────────────────────

    private function getPostulantesData(Request $request): array
    {
        $postulantes = $this->reporteService->postulantesReport($request->get('estado_promedio'));
        $result = [];
        foreach ($postulantes as $p) {
            $result[] = [
                $p->ci,
                $p->nombres,
                $p->apellidos,
                $p->carreraPrimera?->nombre ?? '—',
                $p->carreraSegunda?->nombre ?? '—',
                $p->carreraAsignada?->nombre ?? '—',
                $p->gestion?->anio . ' ' . $p->gestion?->periodo ?? '—',
                $p->pago ? ($p->pago->estado ?? '—') : 'Sin pago',
                $p->promedio_final ? number_format($p->promedio_final, 2) : '—',
                $p->estado_promedio ?? '—',
            ];
        }
        return $result;
    }

    private function getAprobadosData(Request $request): array
    {
        $data = $this->reporteService->aprobadosReport();
        $result = [];
        foreach ($data['data'] as $p) {
            $result[] = [
                $p->ci,
                $p->nombres,
                $p->apellidos,
                $p->carreraAsignada?->nombre ?? '—',
                number_format($p->promedio_final, 2),
                $p->estado_promedio ?? 'APROBADO',
            ];
        }
        return $result;
    }

    private function getReprobadosData(Request $request): array
    {
        $data = $this->reporteService->reprobadosReport();
        $result = [];
        foreach ($data['data'] as $p) {
            $result[] = [
                $p->ci,
                $p->nombres,
                $p->apellidos,
                $p->carreraAsignada?->nombre ?? '—',
                number_format($p->promedio_final, 2),
                $p->estado_promedio ?? 'REPROBADO',
            ];
        }
        return $result;
    }

    private function getPromediosData(Request $request): array
    {
        $data = $this->reporteService->promediosReport();
        $result = [];
        foreach ($data as $p) {
            $result[] = [
                $p['ci'],
                $p['nombres'],
                $p['apellidos'],
                $p['carrera_asignada'] ?? '—',
                number_format($p['promedio_final'], 2),
                $p['estado'] ?? '—',
            ];
        }
        return $result;
    }

    private function getGruposData(Request $request): array
    {
        $data = $this->reporteService->gruposReport();
        $result = [];
        foreach ($data as $g) {
            $materias = $g->materias->pluck('nombre')->implode(', ') ?: '—';
            $result[] = [
                $g->codigo,
                $g->nombre,
                $materias,
                $g->estudiantes_count ?? 0,
            ];
        }
        return $result;
    }

    private function getEstadisticasMateriaData(Request $request): array
    {
        $data = $this->reporteService->estadisticasMateriaReport();
        $result = [];
        foreach ($data as $m) {
            $result[] = [
                $m['materia'],
                $m['codigo'],
                $m['total_estudiantes'],
                number_format($m['promedio_general'], 2),
                number_format($m['nota_max'], 2),
                number_format($m['nota_min'], 2),
            ];
        }
        return $result;
    }

    private function getDocentesGruposData(Request $request): array
    {
        $data = $this->reporteService->docentesGruposReport();
        $result = [];
        foreach ($data as $d) {
            $gruposDesc = $d['grupos_asignados']->map(function ($g) {
                return "{$g['grupo']} - {$g['materia']} ({$g['aula']})";
            })->implode('; ') ?: '—';
            $result[] = [
                $d['nombres'],
                $d['apellidos'],
                $d['profesion'] ?? '—',
                $gruposDesc,
                $d['total_grupos'],
            ];
        }
        return $result;
    }

    private function getGruposMasAprobadosData(Request $request): array
    {
        $data = $this->reporteService->gruposMasAprobadosReport();
        $result = [];
        foreach ($data as $g) {
            $result[] = [
                $g['grupo'],
                $g['materia'] ?? '—',
                $g['total_estudiantes'],
                $g['aprobados'],
                $g['reprobados'],
                $g['porcentaje_aprobacion'] . '%',
            ];
        }
        return $result;
    }

    private function getAsistenciaDocenteData(Request $request): array
    {
        $data = $this->reporteService->asistenciaDocenteReport($request);
        $result = [];
        foreach ($data as $a) {
            $result[] = [
                $a['docente'],
                $a['grupo'] ?? '—',
                $a['materia'] ?? '—',
                $a['fecha'] ?? '—',
                $a['horario'] ?? '—',
                $a['estado'] ?? '—',
                $a['observaciones'] ?? '—',
            ];
        }
        return $result;
    }

    private function getCuposCarreraData(Request $request): array
    {
        $data = $this->reporteService->cuposCarreraReport();
        $result = [];
        foreach ($data as $c) {
            $result[] = [
                $c['codigo'],
                $c['nombre'],
                $c['cupo_maximo'],
                $c['cupo_actual'],
                $c['cupo_disponible'],
                $c['porcentaje_ocupacion'] . '%',
            ];
        }
        return $result;
    }
}
