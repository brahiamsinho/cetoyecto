<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CargaHorariaSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('carga_horaria_docente')->count() > 0) {
            $this->command->info('CargaHorariaSeeder: already has data, skipping.');
            return;
        }

        $docentes = DB::table('docentes')->orderBy('id')->pluck('id')->values();
        $grupo    = DB::table('grupos')->first();

        if ($docentes->isEmpty() || ! $grupo) {
            $this->command->warn('CargaHorariaSeeder: missing docentes or grupos.');
            return;
        }

        // Docente 1 → Computación   | aula 1 | horario 1 (Lunes mañana)
        // Docente 2 → Matemáticas   | aula 2 | horario 3 (Martes mañana)
        // Docente 3 → Inglés        | aula 1 | horario 5 (Lunes tarde)
        // Docente 4 → Física        | aula 2 | horario 7 (Martes tarde)
        $asignaciones = [
            ['docente_id' => $docentes[0], 'grupo_id' => $grupo->id, 'materia_id' => 1, 'aula_id' => 1, 'horario_id' => 1],
            ['docente_id' => $docentes[1], 'grupo_id' => $grupo->id, 'materia_id' => 2, 'aula_id' => 2, 'horario_id' => 3],
            ['docente_id' => $docentes[2], 'grupo_id' => $grupo->id, 'materia_id' => 3, 'aula_id' => 1, 'horario_id' => 5],
            ['docente_id' => $docentes[3], 'grupo_id' => $grupo->id, 'materia_id' => 4, 'aula_id' => 2, 'horario_id' => 7],
        ];

        foreach ($asignaciones as &$row) {
            $row['created_at'] = now();
            $row['updated_at'] = now();
        }

        DB::table('carga_horaria_docente')->insert($asignaciones);

        $this->command->info('CargaHorariaSeeder: 4 asignaciones created.');
    }
}
