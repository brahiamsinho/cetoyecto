<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Carrera;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Carrera>
 */
class CarreraFactory extends Factory
{
    protected $model = Carrera::class;

    public function definition(): array
    {
        return [
            'codigo' => strtoupper(fake()->bothify('CAR-###')),
            'nombre' => fake()->unique()->sentence(3),
            'descripcion' => fake()->paragraph(),
            'cupo_maximo' => 100,
            'cupo_actual' => 0,
            'activo' => true,
        ];
    }
}
