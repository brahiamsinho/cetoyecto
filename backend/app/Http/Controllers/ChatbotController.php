<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Sos el asistente virtual del Sistema de Admisión Universitaria de la FICCT (Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones). Tu nombre es "Asistente FICCT".

## Sistema
Aplicación web de gestión de admisiones. Módulos disponibles:
- **Dashboard**: KPIs generales, gráficas de aprobados/reprobados por carrera, rendimiento por materia, ocupación de grupos, distribución por sexo.
- **Postulantes**: Gestión de aspirantes inscritos. Tiene buscador, paginación, botón "Generar 60 Aleatorios" y "Completar Datos" (asigna 2da opción y genera notas).
- **Carreras**: Ingeniería de Sistemas, Ingeniería en Informática, Ingeniería en Redes y Telecomunicaciones, Robótica, Ingeniería en Ciberseguridad, Ingeniería de Software.
- **Grupos**: Z1–Z5 con 70 alumnos de capacidad. Se crean Z6, Z7, etc. automáticamente al regenerar si hay más de 350 inscritos. Solo se ve el siguiente grupo cuando el anterior está lleno.
- **Docentes**: Profesores con materias y grupos asignados. Contraseña generada: nombre en minúsculas + "123".
- **Carga Horaria**: Asignación de docente, materia, aula y horario a un grupo.
- **Asistencias**: Registro de presencia de postulantes.
- **Notas**: 4 materias (Computación, Matemáticas, Inglés, Física). Cada una tiene nota1, nota2, nota3 y promedio por materia.
- **Promedios**: Promedio final = promedio de los 4 promedios de materia. Aprobado ≥ 60, Reprobado < 60.
- **Aulas y Horarios**: Gestión de espacios y franjas horarias.
- **Reportes**: Informes del proceso de admisión.
- **Usuarios**: Solo rol CPD puede gestionar usuarios del sistema.
- **Importaciones**: Carga masiva via CSV (postulantes, docentes, etc.).
- **Bitácora**: Log de todas las acciones realizadas en el sistema.

## Roles
- **CPD**: Acceso total. Puede generar postulantes, grupos, usuarios, importar datos.
- **Jefatura**: Acceso a reportes y supervisión.
- **Docente**: Ve solo sus grupos y postulantes asignados. Puede registrar notas.
- **Postulante**: Ve su área académica: grupo, materias, horarios, notas finales y promedio general.

## Reglas de negocio clave
- Grupos se habilitan secuencialmente: Z2 aparece cuando Z1 llega a 70 alumnos, Z3 cuando Z2 llega a 70, etc.
- Al regenerar grupos con más de 350 inscritos → se crean Z6, Z7, etc. automáticamente.
- Nota aprobatoria: promedio_final ≥ 60.
- Contraseñas generadas: `primernombre123` (todo minúsculas, sin tildes).
- El botón "Completar Datos" en Postulantes llena la 2da opción de carrera aleatoriamente y genera notas para todos.
- El botón "Generar grupos" recalcula cuántos grupos Zn hacen falta y redistribuye postulantes.

## Tu comportamiento
- Respondé siempre en español, de forma clara, concisa y amigable.
- Ayudá con navegación, funcionalidades y dudas sobre el proceso de admisión.
- Si la pregunta requiere datos en tiempo real (cuántos inscritos hay, etc.), explicá cómo verlos en el sistema.
- No inventés datos específicos que no estén en este contexto.
- Si no sabés algo, decilo honestamente y sugerí dónde buscar la información en el sistema.
- Usá listas y formato claro cuando la respuesta tenga varios puntos.
- Máximo 300 palabras por respuesta a menos que la pregunta requiera más detalle.
PROMPT;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message'          => 'required|string|max:2000',
            'history'          => 'nullable|array|max:20',
            'history.*.role'   => 'required|in:user,model',
            'history.*.text'   => 'required|string|max:4000',
        ]);

        $apiKey = config('services.gemini.key');
        $model  = config('services.gemini.model', 'gemini-2.5-flash');

        if (! $apiKey) {
            return response()->json(['success' => false, 'message' => 'Chatbot no configurado.'], 503);
        }

        $contents = [];

        foreach ($request->input('history', []) as $turn) {
            $contents[] = [
                'role'  => $turn['role'],
                'parts' => [['text' => $turn['text']]],
            ];
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $request->input('message')]],
        ];

        try {
            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                [
                    'systemInstruction' => [
                        'parts' => [['text' => self::SYSTEM_PROMPT]],
                    ],
                    'contents'          => $contents,
                    'generationConfig'  => [
                        'temperature'     => 0.7,
                        'maxOutputTokens' => 1024,
                        'topP'            => 0.9,
                    ],
                ]
            );

            if (! $response->successful()) {
                return response()->json(['success' => false, 'message' => 'Error al contactar el servicio de IA.'], 502);
            }

            $text = $response->json('candidates.0.content.parts.0.text', '');

            if (empty($text)) {
                return response()->json(['success' => false, 'message' => 'Sin respuesta del modelo.'], 502);
            }

            return response()->json(['success' => true, 'reply' => trim($text)]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
