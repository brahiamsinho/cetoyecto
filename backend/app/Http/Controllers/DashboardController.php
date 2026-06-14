<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function stats(): JsonResponse
    {
        try {
            $stats = $this->dashboardService->getStats();

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function resumenIa(): JsonResponse
    {
        try {
            $stats  = $this->dashboardService->getStats();
            $apiKey = config('services.gemini.key');
            $model  = config('services.gemini.model', 'gemini-2.5-flash');

            if (! $apiKey) {
                return response()->json(['success' => false, 'message' => 'Gemini no configurado.'], 503);
            }

            $porCarrera = collect($stats['admitidos_por_carrera'])->map(fn ($c) =>
                "  - {$c['nombre']}: {$c['total_postulantes']} inscritos, {$c['total_admitidos']} aprobados, {$c['total_reprobados']} reprobados"
            )->implode("\n");

            $porMateria = collect($stats['promedio_por_materia'])->map(fn ($m) =>
                "  - {$m['nombre']}: promedio {$m['promedio_avg']}, tasa aprobación {$m['tasa_aprobacion']}%"
            )->implode("\n");

            $porGrupo = collect($stats['postulantes_por_grupo'])->map(fn ($g) =>
                "  - {$g['grupo']}: {$g['total']}/{$g['capacidad']} alumnos"
            )->implode("\n");

            $sexo = collect($stats['distribucion_sexo'])->map(fn ($s) =>
                "  - {$s['sexo']}: {$s['total']}"
            )->implode("\n");

            $prompt = <<<PROMPT
Sos el analista académico del Sistema de Admisión FICCT. Generá un resumen ejecutivo profesional y conciso (máximo 250 palabras) en español, dirigido a las autoridades de la facultad.

Datos del proceso de admisión actual:

TOTALES
- Inscritos: {$stats['total_inscritos']}
- Aprobados: {$stats['total_aprobados']} ({$stats['tasa_aprobacion']}%)
- Reprobados: {$stats['total_reprobados']}
- Grupos activos: {$stats['total_grupos']}
- Docentes: {$stats['total_docentes']}
- Carreras: {$stats['total_carreras']}

POR CARRERA
{$porCarrera}

POR MATERIA
{$porMateria}

POR GRUPO
{$porGrupo}

DISTRIBUCIÓN POR SEXO
{$sexo}

Instrucciones para el resumen:
- Identificá los puntos más destacados: carreras con mayor/menor demanda, materias con mayor dificultad, grupos con mayor ocupación.
- Señalá tendencias o alertas relevantes (ej: materia con tasa de aprobación baja, grupo casi lleno).
- Usá un tono formal y ejecutivo, sin jerga técnica.
- Estructurá la respuesta en 2-3 párrafos cortos sin títulos ni bullets.
- No repitas todos los números, sintetizá lo más relevante.
- NO uses formato markdown (sin asteriscos, sin negritas, sin #). Solo texto plano.
PROMPT;

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(30)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents'         => [['role' => 'user', 'parts' => [['text' => $prompt]]]],
                    'generationConfig' => [
                        'temperature'    => 0.4,
                        'maxOutputTokens' => 2048,
                        'thinkingConfig' => ['thinkingBudget' => 0],
                    ],
                ]);

            if (! $response->successful()) {
                return response()->json(['success' => false, 'message' => 'Error al contactar Gemini.'], 502);
            }

            $resumen = $response->json('candidates.0.content.parts.0.text', '');

            return response()->json(['success' => true, 'data' => ['resumen' => trim($resumen)]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
