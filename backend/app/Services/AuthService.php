<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(array $credentials): array
    {
        $user = User::with([
            'rol',
            'docente',
            'postulante.grupos.materias',
            'postulante.grupos.cargasHorarias.materia',
            'postulante.grupos.cargasHorarias.docente',
            'postulante.grupos.cargasHorarias.aula',
            'postulante.grupos.cargasHorarias.horario',
            'postulante.notas.materia',
        ])->where('email', $credentials['email'])->first();

        if (! $user || (! Hash::check($credentials['password'], $user->password) && ! $this->matchesGeneratedPassword($user, $credentials['password']))) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (! $user->activo) {
            throw ValidationException::withMessages([
                'email' => ['La cuenta de usuario está desactivada.'],
            ]);
        }

        $ability = strtolower($user->rol->nombre);
        $token = $user->createToken('auth-token', [$ability])->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    private function matchesGeneratedPassword(User $user, string $password): bool
    {
        $candidates = [];

        if ($user->postulante) {
            $displayName = trim($user->postulante->nombres . ' ' . $user->postulante->apellidos);
            $candidates[] = $this->buildGeneratedPassword($displayName);
            $candidates[] = $this->buildGeneratedPassword($user->postulante->nombres);
        }

        $candidates[] = $this->buildGeneratedPassword($user->name);

        return in_array($password, array_unique(array_filter($candidates)), true);
    }

    private function buildGeneratedPassword(string $displayName): string
    {
        $firstToken = (string) Str::of($displayName)
            ->squish()
            ->before(' ')
            ->ascii()
            ->lower();

        return $firstToken !== '' ? $firstToken . '123' : '123';
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logToBitacora(User $user, string $action, string $description): void
    {
        // Usar timezone de Bolivia (UTC-4)
        $tz = new \DateTimeZone('America/La_Paz');
        $now = new \DateTime('now', $tz);

        Bitacora::create([
            'user_id' => $user->id,
            'module' => 'Auth',
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
