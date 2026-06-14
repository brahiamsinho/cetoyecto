<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Docente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Docente>
 */
class DocenteFactory extends Factory
{
    protected $model = Docente::class;

    public function definition(): array
    {
        return [
            'ci' => fake()->unique()->numerify('########'),
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->phoneNumber(),
            'profesion' => fake()->randomElement(['Ingeniero de Sistemas', 'Licenciado en Matemáticas', 'Licenciado en Lenguas', 'Ingeniero en Redes', 'Físico']),
            'maestria' => fake()->boolean(30),
            'diplomado_educacion_superior' => fake()->boolean(50),
            'contratado' => fake()->boolean(70),
            'user_id' => null,
        ];
    }
}
