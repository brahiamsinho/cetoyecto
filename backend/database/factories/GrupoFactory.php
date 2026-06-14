<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Gestion;
use App\Models\Grupo;
use App\Models\Materia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Grupo>
 */
class GrupoFactory extends Factory
{
    protected $model = Grupo::class;

    public function definition(): array
    {
        return [
            'codigo' => strtoupper(fake()->bothify('GRP-###')),
            'nombre' => 'Grupo ' . fake()->randomLetter() . fake()->numberBetween(1, 5),
            'materia_id' => Materia::factory(),
            'gestion_id' => Gestion::factory(),
        ];
    }
}
