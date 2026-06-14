<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Postulante;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostulantePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera', 'Autoridad/Decanato']);
    }

    public function view(User $user, Postulante $postulante): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera', 'Autoridad/Decanato']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    public function update(User $user, Postulante $postulante): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    public function delete(User $user, Postulante $postulante): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    public function restore(User $user, Postulante $postulante): bool
    {
        return $user->role?->nombre === 'CPD';
    }

    public function forceDelete(User $user, Postulante $postulante): bool
    {
        return $user->role?->nombre === 'CPD';
    }
}
