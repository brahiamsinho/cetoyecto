<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Horario>
 */
class HorarioFactory extends Factory
{
    protected $model = Horario::class;

    public function definition(): array
    {
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        $turnos = ['mañana', 'tarde', 'noche'];

        $horaInicio = fake()->randomElement(['07:00', '08:00', '09:00', '14:00', '15:00', '18:00', '19:00']);
        $horaFin = match ($horaInicio) {
            '07:00' => '08:30',
            '08:00' => '09:30',
            '09:00' => '10:30',
            '14:00' => '15:30',
            '15:00' => '16:30',
            '18:00' => '19:30',
            '19:00' => '20:30',
            default => '09:00',
        };

        $turno = match (true) {
            (int) explode(':', $horaInicio)[0] < 12 => 'mañana',
            (int) explode(':', $horaInicio)[0] < 17 => 'tarde',
            default => 'noche',
        };

        return [
            'dia' => fake()->randomElement($dias),
            'hora_inicio' => $horaInicio,
            'hora_fin' => $horaFin,
            'turno' => $turno,
        ];
    }
}
