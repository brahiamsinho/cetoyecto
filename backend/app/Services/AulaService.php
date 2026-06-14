<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Aula;

class AulaService
{
    public function listAll()
    {
        return Aula::orderBy('codigo')->get();
    }

    public function create(array $data): Aula
    {
        return Aula::create($data);
    }

    public function update(Aula $aula, array $data): Aula
    {
        $aula->update($data);

        return $aula->fresh();
    }

    public function delete(Aula $aula): void
    {
        $aula->delete();
    }
}
