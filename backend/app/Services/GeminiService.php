<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Postulante;
use App\Models\Nota;
use App\Models\Pago;
use App\Models\Docente;
use App\Models\AsistenciaDocente;
use App\Models\Carrera;
use App\Models\Grupo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', '');
        $this->model = config('services.gemini.model', 'gemini-2.5-flash');
    }

    /**
     * Genera un reporte personalizado usando Gemini.
     *
     * @param string $prompt El prompt del usuario describiendo el reporte
     * @param string $contexto El contexto de datos del sistema (JSON)
     * @return array|null
     */
    public function generarReporte(string $prompt, string $contexto): ?array
    {
        if (empty($this->apiKey)) {
            return [
                'error' => true,
                'message' => 'La API key de Gemini no está configurada. Configurá GEMINI_API_KEY en el archivo .env.',
            ];
        }

        try {
            $systemPrompt = $this->buildSystemPrompt($contexto);
            
            $response = Http::timeout(120)
                ->connectTimeout(30)
                ->post("{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                [
                                    'text' => $systemPrompt . "\n\nPROMPT DEL USUARIO:\n" . $prompt,
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'maxOutputTokens' => 8192,
                    ],
                ]);

            if ($response->failed()) {
                Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
                return [
                    'error' => true,
                    'message' => 'Error al conectar con Gemini: ' . $response->body(),
                ];
            }

            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$text) {
                return [
                    'error' => true,
                    'message' => 'Gemini no generó contenido. Intentá con un prompt diferente.',
                ];
            }

            // Parsear la respuesta para extraer el título, contenido HTML y datos
            return $this->parsearRespuesta($text);
        } catch (\Exception $e) {
            Log::error('Gemini exception', ['error' => $e->getMessage()]);
            return [
                'error' => true,
                'message' => 'Error al generar reporte: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Construye el prompt del sistema con los datos del sistema.
     */
    private function buildSystemPrompt(string $contexto): string
    {
        return <<<PROMPT
Sos un asistente experto en análisis académico universitario para el Sistema de Admisión CUP-FICCT.

DATOS DEL SISTEMA:
{$contexto}

INSTRUCCIONES:
1. Analizá la solicitud del usuario y generá un reporte claro y profesional.
2. Usá ÚNICAMENTE los datos proporcionados. No inventes datos.
3. Si los datos son insuficientes, indicalo claramente.
4. Devolvé la respuesta en formato JSON válido con esta estructura EXACTA:

{
    "titulo": "Título claro del reporte",
    "resumen": "Resumen ejecutivo de 2-3 oraciones",
    "columnas": ["Columna1", "Columna2", "Columna3"],
    "filas": [
        ["Valor1", "Valor2", "Valor3"],
        ["Valor1", "Valor2", "Valor3"]
    ],
    "conclusiones": [
        "Conclusión 1 basada en los datos",
        "Conclusión 2 basada en los datos"
    ]
}

REGLAS:
- El JSON debe ser válido (sin comentarios, sin trailing commas).
- Las columnas deben ser nombres cortos y descriptivos.
- Las filas deben contener los datos reales.
- Las conclusiones deben ser insights útiles (mínimo 2, máximo 5).
- Todo en español, adaptado a Bolivia.
- No incluyas texto fuera del JSON.
PROMPT;
    }

    /**
     * Parsea la respuesta de Gemini para extraer el JSON estructurado.
     */
    private function parsearRespuesta(string $text): array
    {
        $titulo = 'Reporte Personalizado';
        $resumen = '';
        $columnas = [];
        $filas = [];
        $conclusiones = [];

        // Intentar extraer JSON del texto
        // Primero buscar JSON entre llaves
        if (preg_match('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $text, $matches)) {
            $jsonStr = $matches[0];
            try {
                $data = json_decode($jsonStr, true, 512, JSON_THROW_ON_ERROR);
                
                if (isset($data['titulo'])) $titulo = $data['titulo'];
                if (isset($data['resumen'])) $resumen = $data['resumen'];
                if (isset($data['columnas'])) $columnas = $data['columnas'];
                if (isset($data['filas'])) $filas = $data['filas'];
                if (isset($data['conclusiones'])) $conclusiones = $data['conclusiones'];
            } catch (\Exception $e) {
                Log::warning('No se pudo parsear JSON de Gemini', ['json' => $jsonStr, 'error' => $e->getMessage()]);
            }
        }

        // Si no hay datos estructurados, usar el texto completo como resumen
        if (empty($columnas) && empty($filas)) {
            $resumen = $text;
        }

        return [
            'error' => false,
            'titulo' => $titulo,
            'resumen' => $resumen,
            'columnas' => $columnas,
            'filas' => $filas,
            'conclusiones' => $conclusiones,
        ];
    }

    /**
     * Obtiene el contexto de datos del sistema para enviar a Gemini.
     */
    public function obtenerContextoSistema(): string
    {
        $stats = [];

        // Postulantes
        $stats['total_postulantes'] = Postulante::count();
        $stats['postulantes_inscritos'] = Postulante::where('estado', 'inscrito')->count();
        $stats['postulantes_admitidos'] = Postulante::where('estado', 'admitido')->count();
        $stats['postulantes_rechazados'] = Postulante::where('estado', 'rechazado')->count();

        // Promedios
        $stats['promedio_general'] = round((float) (Nota::avg('promedio') ?? 0), 2);
        $stats['total_aprobados'] = (int) Nota::where('promedio', '>=', 60)->count();
        $stats['total_reprobados'] = (int) Nota::where('promedio', '<', 60)->count();

        // Pagos
        $stats['pagos_pagados'] = Pago::where('estado', 'pagado')->count();
        $stats['pagos_pendientes'] = Pago::where('estado', 'pendiente')->count();
        $stats['pagos_rechazados'] = Pago::where('estado', 'rechazado')->count();

        // Carreras
        $carreras = Carrera::select('nombre', 'cupo_maximo', 'cupo_actual')
            ->where('activo', true)
            ->get()
            ->toArray();
        $stats['carreras'] = $carreras;

        // Docentes
        $stats['total_docentes'] = Docente::count();
        $stats['docentes_con_carga'] = Docente::has('cargasHorarias')->count();

        // Grupos
        $stats['total_grupos'] = Grupo::count();
        $stats['grupos_con_estudiantes'] = Grupo::has('postulantes')->count();

        // Asistencias
        $stats['total_asistencias'] = AsistenciaDocente::count();
        $stats['asistencias_presente'] = AsistenciaDocente::where('estado', 'presente')->count();
        $stats['asistencias_ausente'] = AsistenciaDocente::where('estado', 'ausente')->count();

        return json_encode($stats, JSON_PRETTY_PRINT);
    }
}
