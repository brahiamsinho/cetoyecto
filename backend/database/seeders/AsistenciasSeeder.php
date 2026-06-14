<?php

declare(strict_types=1);

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AsistenciasSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('asistencias_docentes')->count() > 0) {
            $this->command->info('AsistenciasSeeder: already has data, skipping.');
            return;
        }

        $cargas = DB::table('carga_horaria_docente')
            ->join('horarios', 'carga_horaria_docente.horario_id', '=', 'horarios.id')
            ->select('carga_horaria_docente.*', 'horarios.dia')
            ->get();

        if ($cargas->isEmpty()) {
            $this->command->warn('AsistenciasSeeder: no carga horaria found.');
            return;
        }

        $diasMap = [
            'Lunes'     => Carbon::MONDAY,
            'Martes'    => Carbon::TUESDAY,
            'Miércoles' => Carbon::WEDNESDAY,
            'Jueves'    => Carbon::THURSDAY,
            'Viernes'   => Carbon::FRIDAY,
        ];

        $estados = ['presente', 'presente', 'presente', 'presente', 'ausente', 'justificado'];
        $rows    = [];
        $today   = Carbon::today();

        foreach ($cargas as $carga) {
            $diaSemana = $diasMap[$carga->dia] ?? Carbon::MONDAY;

            // Generate last 6 occurrences of this weekday
            $fecha = $today->copy()->previous($diaSemana);

            for ($i = 0; $i < 6; $i++) {
                $rows[] = [
                    'docente_id'    => $carga->docente_id,
                    'grupo_id'      => $carga->grupo_id,
                    'materia_id'    => $carga->materia_id,
                    'horario_id'    => $carga->horario_id,
                    'fecha'         => $fecha->toDateString(),
                    'estado'        => $estados[array_rand($estados)],
                    'observaciones' => null,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];

                $fecha = $fecha->copy()->subWeek();
            }
        }

        DB::table('asistencias_docentes')->insert($rows);

        $this->command->info('AsistenciasSeeder: ' . count($rows) . ' asistencias created.');
    }
}
