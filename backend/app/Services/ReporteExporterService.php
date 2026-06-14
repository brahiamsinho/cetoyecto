<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ReporteExporterService
{
    /**
     * Genera un PDF a partir del HTML del reporte.
     */
    public function generarPDF(string $titulo, string $html): ?array
    {
        try {
            $htmlCompleto = $this->wrapHTML($titulo, $html);
            $nombreArchivo = 'reporte_' . time() . '_' . uniqid() . '.pdf';
            $path = 'reportes/' . $nombreArchivo;
            $fullPath = Storage::path($path);

            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            if (class_exists(\Dompdf\Dompdf::class)) {
                $dompdf = new \Dompdf\Dompdf();
                $dompdf->loadHtml($htmlCompleto);
                $dompdf->setPaper('A4', 'portrait');
                $dompdf->render();
                file_put_contents($fullPath, $dompdf->output());
            } else {
                $htmlPath = str_replace('.pdf', '.html', $fullPath);
                file_put_contents($htmlPath, $htmlCompleto);
                $nombreArchivo = str_replace('.pdf', '.html', $nombreArchivo);
            }

            return [
                'url' => '/api/reportes/descargar/' . $nombreArchivo,
                'nombre' => $nombreArchivo,
                'path' => $fullPath,
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generando PDF', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Genera un Excel a partir de los datos del reporte.
     */
    public function generarExcel(string $titulo, array $datosJson, string $html): ?array
    {
        try {
            $nombreArchivo = 'reporte_' . time() . '_' . uniqid() . '.xlsx';
            $path = 'reportes/' . $nombreArchivo;
            $fullPath = Storage::path($path);

            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            if (class_exists(\PhpOffice\PhpSpreadsheet\Spreadsheet::class)) {
                $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();

                $sheet->setCellValue('A1', $titulo);
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->mergeCells('A1:D1');

                $sheet->setCellValue('A2', 'Generado: ' . date('d/m/Y H:i:s'));
                $sheet->mergeCells('A2:D2');

                $row = 4;
                if (isset($datosJson['datos_clave']) && is_array($datosJson['datos_clave'])) {
                    $sheet->setCellValue('A3', 'Datos Clave');
                    $sheet->getStyle('A3')->getFont()->setBold(true);
                    
                    foreach ($datosJson['datos_clave'] as $dato) {
                        $sheet->setCellValue('A' . $row, $dato['label'] ?? '');
                        $sheet->setCellValue('B' . $row, $dato['valor'] ?? '');
                        $row++;
                    }
                }

                $row += 2;
                if (isset($datosJson['resumen'])) {
                    $sheet->setCellValue('A' . $row, 'Resumen');
                    $sheet->getStyle('A' . $row)->getFont()->setBold(true);
                    $row++;
                    $sheet->setCellValue('A' . $row, $datosJson['resumen']);
                    $sheet->getStyle('A' . $row)->getAlignment()->setWrapText(true);
                    $sheet->mergeCells('A' . $row . ':D' . $row);
                }

                $sheet->getColumnDimension('A')->setAutoSize(true);
                $sheet->getColumnDimension('B')->setAutoSize(true);

                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $writer->save($fullPath);
            } else {
                $csvPath = str_replace('.xlsx', '.csv', $fullPath);
                $csv = fopen($csvPath, 'w');
                
                fputcsv($csv, [$titulo]);
                fputcsv($csv, ['Generado: ' . date('d/m/Y H:i:s')]);
                fputcsv($csv, []);
                
                if (isset($datosJson['datos_clave'])) {
                    fputcsv($csv, ['Datos Clave']);
                    foreach ($datosJson['datos_clave'] as $dato) {
                        fputcsv($csv, [$dato['label'] ?? '', $dato['valor'] ?? '']);
                    }
                }
                
                fclose($csv);
                $nombreArchivo = str_replace('.xlsx', '.csv', $nombreArchivo);
            }

            return [
                'url' => '/api/reportes/descargar/' . $nombreArchivo,
                'nombre' => $nombreArchivo,
                'path' => $fullPath,
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generando Excel', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Wrap HTML con estilos básicos para PDF.
     */
    private function wrapHTML(string $titulo, string $html): string
    {
        return "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <title>" . htmlspecialchars($titulo) . "</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; font-size: 12px; }
        h1 { color: #1e40af; font-size: 18px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
        h2 { color: #1e40af; font-size: 14px; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1e40af; color: white; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .resumen { background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; }
        .footer { margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
</head>
<body>
    <h1>" . htmlspecialchars($titulo) . "</h1>
    <p><strong>Generado:</strong> " . date('d/m/Y H:i:s') . "</p>
    <hr>
    " . $html . "
    <div class='footer'>
        <p>Reporte generado por CUP-FICCT System con Gemini AI</p>
    </div>
</body>
</html>";
    }
}
