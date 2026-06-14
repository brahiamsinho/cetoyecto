<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Materia;

class MateriaService
{
    public function listAll()
    {
        return Materia::orderBy('nombre')->get();
    }

    public function create(array $data): Materia
    {
        return Materia::create($data);
    }

    public function update(Materia $materia, array $data): Materia
    {
        $materia->update($data);

        return $materia->fresh();
    }

    public function delete(Materia $materia): void
    {
        $materia->delete();
    }
}
