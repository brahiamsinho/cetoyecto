<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Services\UserService;
use App\Traits\HasBitacora;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class UserController extends Controller
{
    use HasBitacora;
    public function __construct(
        private readonly UserService $userService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('role.cpd');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $users = $this->userService->listFiltered($request);

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar usuarios: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->validated());

            $this->logBitacora(
                'CREAR',
                'Usuarios',
                "Se creó el usuario {$user->name} ({$user->email}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuario creado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $user = User::with('rol')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado.',
            ], 404);
        }
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user = $this->userService->updateUser($user, $request->validated());

            $this->logBitacora(
                'ACTUALIZAR',
                'Usuarios',
                "Se actualizó el usuario {$user->name} ({$user->email}).",
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuario actualizado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $this->userService->deactivateUser($user);

            $this->logBitacora(
                'DESACTIVAR',
                'Usuarios',
                "Se desactivó el usuario {$user->name} ({$user->email}).",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Usuario desactivado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function activate(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $this->userService->activateUser($user);

            $this->logBitacora(
                'ACTIVAR',
                'Usuarios',
                "Se activó el usuario {$user->name} ({$user->email}).",
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Usuario activado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al activar usuario: ' . $e->getMessage(),
            ], 500);
        }
    }
}
