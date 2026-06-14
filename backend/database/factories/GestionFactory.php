<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Gestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Gestion>
 */
class GestionFactory extends Factory
{
    protected $model = Gestion::class;

    public function definition(): array
    {
        return [
            'anio' => fake()->numberBetween(2024, 2026),
            'periodo' => 'I-' . fake()->numberBetween(2024, 2026),
            'activa' => false,
        ];
    }
}
