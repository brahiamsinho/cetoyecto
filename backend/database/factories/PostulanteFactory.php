<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Carrera;
use App\Models\Gestion;
use App\Models\Postulante;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Postulante>
 */
class PostulanteFactory extends Factory
{
    protected $model = Postulante::class;

    public function definition(): array
    {
        return [
            'ci' => fake()->unique()->numerify('########'),
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'fecha_nacimiento' => fake()->date('Y-m-d', '2005-12-31'),
            'sexo' => fake()->randomElement(['M', 'F']),
            'direccion' => fake()->address(),
            'telefono' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'colegio_procedencia' => 'Colegio ' . fake()->lastName(),
            'ciudad' => fake()->city(),
            'carrera_primera_id' => Carrera::factory(),
            'carrera_segunda_id' => null,
            'titulo_bachiller' => false,
            'tiene_carnet_identidad' => true,
            'tiene_foto' => true,
            'tiene_diploma_bachiller' => true,
            'gestion_id' => Gestion::factory(),
            'estado' => 'pendiente',
            'carrera_asignada_id' => null,
        ];
    }
}
