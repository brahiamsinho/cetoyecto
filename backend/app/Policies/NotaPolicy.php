<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CargaHorariaDocente;
use App\Models\Nota;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NotaPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Nota $nota): bool
    {
        return $this->canManageNota($user, $nota);
    }

    public function create(User $user): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera', 'Docente']);
    }

    public function update(User $user, Nota $nota): bool
    {
        return $this->canManageNota($user, $nota);
    }

    public function delete(User $user, Nota $nota): bool
    {
        return in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera']);
    }

    private function canManageNota(User $user, Nota $nota): bool
    {
        if (in_array($user->role?->nombre, ['CPD', 'Jefatura de Carrera'])) {
            return true;
        }

        if ($user->role?->nombre === 'Docente') {
            $docente = $user->docente;

            if (! $docente) {
                return false;
            }

            return CargaHorariaDocente::where('docente_id', $docente->id)
                ->where('materia_id', $nota->materia_id)
                ->exists();
        }

        return false;
    }
}
