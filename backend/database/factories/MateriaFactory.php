<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Materia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Materia>
 */
class MateriaFactory extends Factory
{
    protected $model = Materia::class;

    public function definition(): array
    {
        return [
            'codigo' => strtoupper(fake()->bothify('MAT-###')),
            'nombre' => fake()->unique()->word(),
            'descripcion' => fake()->sentence(),
        ];
    }
}
