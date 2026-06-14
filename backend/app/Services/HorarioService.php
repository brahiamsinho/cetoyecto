<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Horario;

class HorarioService
{
    public function listAll()
    {
        return Horario::with('cargasHorarias.grupo')->orderBy('dia')->orderBy('hora_inicio')->get();
    }

    public function create(array $data): Horario
    {
        return Horario::create($data);
    }

    public function update(Horario $horario, array $data): Horario
    {
        $horario->update($data);

        return $horario->fresh();
    }

    public function delete(Horario $horario): void
    {
        $horario->delete();
    }
}
