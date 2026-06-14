<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\BitacoraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BitacoraController extends Controller
{
    public function __construct(
        private readonly BitacoraService $bitacoraService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $bitacoras = $this->bitacoraService->getFiltered($request);

            return response()->json([
                'success' => true,
                'data' => $bitacoras,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar bitácora: ' . $e->getMessage(),
            ], 500);
        }
    }
}
