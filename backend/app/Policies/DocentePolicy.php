<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocentePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera', 'Docente']);
    }

    public function view(User $user, Docente $docente): bool
    {
        if (in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera'])) {
            return true;
        }

        return $user->docente?->id === $docente->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    public function update(User $user, Docente $docente): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    public function delete(User $user, Docente $docente): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }
}
