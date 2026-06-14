<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Horario;
use Illuminate\Database\Seeder;

class HorarioSeeder extends Seeder
{
    public function run(): void
    {
        $horarios = [
            ['dia' => 'Lunes', 'hora_inicio' => '07:00', 'hora_fin' => '08:30', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '08:30', 'hora_fin' => '10:00', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '07:00', 'hora_fin' => '09:15', 'turno' => 'mañana'],
            ['dia' => 'Martes', 'hora_inicio' => '09:15', 'hora_fin' => '11:30', 'turno' => 'mañana'],
            ['dia' => 'Lunes', 'hora_inicio' => '14:00', 'hora_fin' => '15:30', 'turno' => 'tarde'],
            ['dia' => 'Lunes', 'hora_inicio' => '15:30', 'hora_fin' => '17:00', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '14:00', 'hora_fin' => '16:15', 'turno' => 'tarde'],
            ['dia' => 'Martes', 'hora_inicio' => '16:15', 'hora_fin' => '18:00', 'turno' => 'tarde'],
        ];

        foreach ($horarios as $horario) {
            Horario::firstOrCreate(
                ['dia' => $horario['dia'], 'hora_inicio' => $horario['hora_inicio'], 'hora_fin' => $horario['hora_fin']],
                $horario
            );
        }
    }
}
