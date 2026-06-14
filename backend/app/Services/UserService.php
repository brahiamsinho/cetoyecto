<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Docente;
use App\Models\Postulante;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    public function listFiltered(Request $request)
    {
        $query = User::with('rol');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function createUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'rol_id' => $data['rol_id'],
        ]);

        return $user->load('rol');
    }

    public function updateUser(User $user, array $data): User
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'rol_id' => $data['rol_id'],
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        return $user->fresh()->load('rol');
    }

    public function syncDocenteAccount(Docente $docente): User
    {
        $user = $this->syncPersonAccount(
            linkedUserId: $docente->user_id,
            name: $this->buildDisplayName($docente->nombres, $docente->apellidos),
            email: $docente->email,
            roleName: 'Docente',
            roleDescription: 'Docente de la universidad'
        );

        if ($docente->user_id !== $user->id) {
            $docente->forceFill(['user_id' => $user->id])->saveQuietly();
        }

        return $user;
    }

    public function syncPostulanteAccount(Postulante $postulante): User
    {
        $user = $this->syncPersonAccount(
            linkedUserId: $postulante->user_id,
            name: $this->buildDisplayName($postulante->nombres, $postulante->apellidos),
            email: $postulante->email,
            roleName: 'Postulante',
            roleDescription: 'Postulante del sistema'
        );

        if ($postulante->user_id !== $user->id) {
            $postulante->forceFill(['user_id' => $user->id])->saveQuietly();
        }

        return $user;
    }

    public function deactivateUser(User $user): void
    {
        $user->update(['activo' => false]);
    }

    public function activateUser(User $user): void
    {
        $user->update(['activo' => true]);
    }

    private function syncPersonAccount(?int $linkedUserId, string $name, string $email, string $roleName, string $roleDescription): User
    {
        $role = Role::firstOrCreate(
            ['nombre' => $roleName],
            ['descripcion' => $roleDescription]
        );

        $payload = [
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($this->generatePassword($name)),
            'rol_id' => $role->id,
        ];

        $user = null;

        if ($linkedUserId) {
            $user = User::find($linkedUserId);
        }

        if (!$user) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            $user->update($payload);
        } else {
            $user = User::create($payload);
        }

        return $user->fresh()->load('rol');
    }

    private function buildDisplayName(string $nombres, string $apellidos): string
    {
        return (string) Str::of(trim($nombres . ' ' . $apellidos))->squish();
    }

    private function generatePassword(string $displayName): string
    {
        $firstName = (string) Str::of($displayName)
            ->squish()
            ->before(' ')
            ->ascii()
            ->lower();

        return $firstName !== ''
            ? $firstName . '123'
            : '123';
    }
}
