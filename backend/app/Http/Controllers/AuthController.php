<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use App\Http\Controllers\BitacoraController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            $this->authService->logToBitacora(
                $result['user'],
                'INICIO_SESION',
                "El usuario {$result['user']->name} inició sesión."
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $result['user'],
                    'token' => $result['token'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $this->authService->logToBitacora(
                $user,
                'CIERRE_SESION',
                "El usuario {$user->name} cerró sesión."
            );

            $this->authService->logout($user);

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'rol',
            'docente',
            'postulante.carreraPrimera',
            'postulante.carreraSegunda',
            'postulante.carreraAsignada',
            'postulante.grupos.materias',
            'postulante.grupos.cargasHorarias.materia',
            'postulante.grupos.cargasHorarias.docente',
            'postulante.grupos.cargasHorarias.aula',
            'postulante.grupos.cargasHorarias.horario',
            'postulante.notas.materia',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'permissions' => [$user->rol->nombre],
            ],
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada correctamente.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'El enlace de recuperación es inválido o ya expiró.',
        ], 422);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(['email' => $request->email]);

        if ($status === Password::RESET_LINK_SENT) {
            $user = \App\Models\User::where('email', $request->email)->first();
            if ($user) {
                $this->authService->logToBitacora(
                    $user,
                    'SOLICITUD_RECUPERACION',
                    "Enlace de recuperación enviado a {$user->email}."
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Se ha enviado un enlace de recuperación a su correo electrónico.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No se encontró una cuenta con ese correo electrónico.',
        ], 422);
    }
}
