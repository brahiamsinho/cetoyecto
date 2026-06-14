<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Aula;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Aula>
 */
class AulaFactory extends Factory
{
    protected $model = Aula::class;

    public function definition(): array
    {
        return [
            'codigo' => strtoupper(fake()->bothify('AULA-###')),
            'nombre' => 'Aula ' . fake()->numberBetween(1, 50),
            'capacidad' => fake()->numberBetween(20, 60),
            'ubicacion' => fake()->word() . ' ' . fake()->numberBetween(1, 3),
        ];
    }
}
