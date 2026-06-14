<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Postulante;
use App\Http\Requests\StorePostulanteRequest;
use App\Http\Requests\UpdatePostulanteRequest;
use App\Services\PostulanteService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PostulanteController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly PostulanteService $postulanteService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $postulantes = $this->postulantesQuery($request)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $postulantes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar postulantes: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StorePostulanteRequest $request): JsonResponse
    {
        try {
            $postulante = $this->postulanteService->store($request->validated(), $request);

            $this->logBitacora(
                'CREAR',
                'Postulantes',
                "Se registró el postulante {$postulante->nombres} {$postulante->apellidos} (CI: {$postulante->ci}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $postulante->load([
                    'carreraPrimera', 'carreraSegunda', 'carreraAsignada', 'gestion',
                ]),
                'message' => 'Postulante registrado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar postulante: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generarAleatorios(Request $request): JsonResponse
    {
        try {
            $created = $this->postulanteService->generarAleatorios(60);

            $this->logBitacora(
                'GENERAR',
                'Postulantes',
                'Se generaron 60 postulantes aleatorios.',
                $request
            );

            $refrescado = $this->postulantesQuery($request)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $refrescado,
                'created' => $created->count(),
                'message' => 'Se generaron 60 postulantes aleatorios correctamente.',
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar postulantes aleatorios: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function completarDatos(Request $request): JsonResponse
    {
        try {
            $carreraIds = Carrera::pluck('id')->all();
            $materiaIds = Materia::pluck('id')->all();

            $postulantes = Postulante::with('notas')->get();

            $sinSegunda = 0;
            $conNotas = 0;

            foreach ($postulantes as $postulante) {
                if (is_null($postulante->carrera_segunda_id)) {
                    $opciones = array_values(array_filter($carreraIds, fn ($id) => $id !== $postulante->carrera_primera_id));
                    $postulante->carrera_segunda_id = $opciones[array_rand($opciones)];
                    $postulante->saveQuietly();
                    $sinSegunda++;
                }

                $materiasConNota = $postulante->notas->pluck('materia_id')->all();
                $materiasFaltantes = array_diff($materiaIds, $materiasConNota);

                if (empty($materiasFaltantes)) {
                    continue;
                }

                $aprobado = rand(1, 10) <= 6;

                foreach ($materiasFaltantes as $materiaId) {
                    $n1 = $aprobado ? rand(60, 100) : rand(10, 59);
                    $n2 = $aprobado ? rand(60, 100) : rand(10, 59);
                    $n3 = $aprobado ? rand(60, 100) : rand(10, 59);
                    $prom = round(($n1 + $n2 + $n3) / 3, 2);

                    Nota::create([
                        'postulante_id' => $postulante->id,
                        'materia_id'    => $materiaId,
                        'nota1'         => $n1,
                        'nota2'         => $n2,
                        'nota3'         => $n3,
                        'promedio'      => $prom,
                    ]);
                }

                $conNotas++;
            }

            $this->logBitacora('COMPLETAR', 'Postulantes', "Se completaron datos: $sinSegunda 2das opciones, $conNotas con notas.", $request);

            return response()->json([
                'success' => true,
                'message' => "Datos completados: $sinSegunda postulantes con 2da opción asignada, $conNotas con notas generadas.",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al completar datos: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $postulante = Postulante::with([
                'carreraPrimera',
                'carreraSegunda',
                'carreraAsignada',
                'gestion',
                'pago',
                'requisitos',
                'notas.materia',
                'grupos.cargasHorarias.materia',
                'grupos.cargasHorarias.docente',
                'grupos.cargasHorarias.aula',
                'grupos.cargasHorarias.horario',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $postulante,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Show postulante error: ' . $e->getMessage(), ['id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Postulante no encontrado: ' . $e->getMessage(),
            ], 404);
        }
    }

    public function update(UpdatePostulanteRequest $request, int $id): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($id);
            $postulante = $this->postulanteService->update($postulante, $request->validated(), $request);

            $this->logBitacora(
                'ACTUALIZAR',
                'Postulantes',
                "Se actualizó el postulante {$postulante->nombres} {$postulante->apellidos} (CI: {$postulante->ci}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $postulante->load([
                    'carreraPrimera', 'carreraSegunda', 'carreraAsignada', 'gestion',
                ]),
                'message' => 'Postulante actualizado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar postulante: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($id);
            $nombreCompleto = "{$postulante->nombres} {$postulante->apellidos} (CI: {$postulante->ci})";
            $this->postulanteService->delete($postulante, $request);

            $this->logBitacora(
                'ELIMINAR',
                'Postulantes',
                "Se eliminó el postulante {$nombreCompleto}.",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Postulante eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar postulante: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cambiarEstado(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate(['estado' => 'required|string']);

            $postulante = Postulante::findOrFail($id);
            $estadoAnterior = $postulante->estado;
            $postulante = $this->postulanteService->cambiarEstado(
                $postulante,
                $request->estado,
                $request
            );

            $this->logBitacora(
                'CAMBIAR_ESTADO',
                'Postulantes',
                "Se cambió el estado del postulante {$postulante->nombres} {$postulante->apellidos} de '{$estadoAnterior}' a '{$postulante->estado}'.",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $postulante,
                'message' => 'Estado cambiado correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function postulantesQuery(Request $request)
    {
        $query = Postulante::with([
            'carreraPrimera',
            'carreraSegunda',
            'carreraAsignada',
            'gestion',
            'pago',
            'notas',
        ]);

        if ($search = $request->get('search')) {
            $normalizedSearch = '%' . $this->normalizeSearchTerm((string) $search) . '%';

            $query->where(function ($q) use ($search) {
                $q->whereRaw("translate(lower(ci), 'áéíóúüÁÉÍÓÚÜñÑ', 'aeiouuaeiouunn') like ?", [$normalizedSearch])
                  ->orWhereRaw("translate(lower(nombres), 'áéíóúüÁÉÍÓÚÜñÑ', 'aeiouuaeiouunn') like ?", [$normalizedSearch])
                  ->orWhereRaw("translate(lower(apellidos), 'áéíóúüÁÉÍÓÚÜñÑ', 'aeiouuaeiouunn') like ?", [$normalizedSearch])
                  ->orWhereRaw("translate(lower(email), 'áéíóúüÁÉÍÓÚÜñÑ', 'aeiouuaeiouunn') like ?", [$normalizedSearch]);
            });
        }

        if ($estado = $request->get('estado')) {
            $query->where('estado', $estado);
        }

        if ($carreraId = $request->get('carrera_id')) {
            $query->where(function ($q) use ($carreraId) {
                $q->where('carrera_primera_id', $carreraId)
                  ->orWhere('carrera_segunda_id', $carreraId)
                  ->orWhere('carrera_asignada_id', $carreraId);
            });
        }

        if ($docente = $this->resolverDocenteAutenticado($request)) {
            $gruposDocente = $docente->cargasHorarias()
                ->pluck('grupo_id')
                ->unique()
                ->values();

            if ($gruposDocente->isEmpty()) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereHas('grupos', function ($grupoQuery) use ($gruposDocente) {
                    $grupoQuery->whereIn('grupos.id', $gruposDocente->all());
                });
            }
        }

        return $query;
    }

    private function resolverDocenteAutenticado(Request $request): ?Docente
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $roleName = $user->rol?->nombre ?? $user->rol;
        if ($roleName !== 'Docente') {
            return null;
        }

        return $user->docente
            ?? Docente::query()->where('user_id', $user->id)->first();
    }

    private function normalizeSearchTerm(string $term): string
    {
        return mb_strtolower(trim($term));
    }
}
