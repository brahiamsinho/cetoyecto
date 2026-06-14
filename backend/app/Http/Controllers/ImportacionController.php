<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ImportarUsuariosRequest;
use App\Services\ImportacionService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class ImportacionController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly ImportacionService $importacionService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        try {
            $importaciones = \App\Models\Importacion::with('user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $importaciones,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar importaciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function importarUsuarios(ImportarUsuariosRequest $request): JsonResponse
    {
        try {
            $file = $request->file('archivo');
            $extension = $file->getClientOriginalExtension();

            if (!in_array($extension, ['csv', 'xlsx'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo debe ser CSV o XLSX.',
                ], 422);
            }

            $path = $file->store('importaciones');

            $fullPath = Storage::path($path);

            if ($extension === 'xlsx') {
                $rows = $this->importacionService->procesarXLSX($fullPath);
            } else {
                $rows = $this->importacionService->procesarCSV($fullPath);
            }

            if (empty($rows)) {
                Storage::delete($path);

                return response()->json([
                    'success' => false,
                    'message' => 'El archivo CSV no contiene datos.',
                ], 422);
            }

            $resultado = $this->importacionService->crearUsuarios($rows, $request->user()->id);
            $resultado['total_filas'] = count($rows);

            $importacion = \App\Models\Importacion::create([
                'user_id' => $request->user()->id,
                'tipo' => 'usuarios',
                'archivo' => $file->getClientOriginalName(),
                'total_filas' => count($rows),
                'exitosas' => $resultado['exitosas'],
                'fallidas' => $resultado['fallidas'],
                'errores' => $resultado['errores'],
                'finalizada' => true,
            ]);

            $this->logBitacora(
                'IMPORTAR_USUARIOS',
                'Importaciones',
                "Se importaron usuarios: {$resultado['exitosas']} exitosas, {$resultado['fallidas']} fallidas de {$importacion->total_filas} filas.",
                $request
            );

            Storage::delete($path);

            return response()->json([
                'success' => true,
                'data' => [
                    'importacion' => $importacion,
                    'resultados' => $resultado,
                ],
                'message' => "Importación completada: {$resultado['exitosas']} usuarios procesados, {$resultado['fallidas']} errores.",
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar usuarios: ' . $e->getMessage(),
            ], 500);
        }
    }
}
