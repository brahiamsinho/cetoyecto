<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Materia;
use App\Models\Nota;
use App\Models\Postulante;
use Illuminate\Database\Seeder;

class NotaSeeder extends Seeder
{
    public function run(): void
    {
        $materiaIds = Materia::pluck('id')->all();
        $postulantes = Postulante::with('notas')->get();
        $generadas = 0;

        foreach ($postulantes as $postulante) {
            $materiasConNota = $postulante->notas->pluck('materia_id')->all();
            $faltantes = array_diff($materiaIds, $materiasConNota);

            if (empty($faltantes)) {
                continue;
            }

            $aprobado = rand(1, 10) <= 6;

            foreach ($faltantes as $materiaId) {
                $n1 = $aprobado ? rand(60, 100) : rand(10, 59);
                $n2 = $aprobado ? rand(60, 100) : rand(10, 59);
                $n3 = $aprobado ? rand(60, 100) : rand(10, 59);

                Nota::create([
                    'postulante_id' => $postulante->id,
                    'materia_id'    => $materiaId,
                    'nota1'         => $n1,
                    'nota2'         => $n2,
                    'nota3'         => $n3,
                    'promedio'      => round(($n1 + $n2 + $n3) / 3, 2),
                ]);

                $generadas++;
            }
        }

        $this->command->info("NotaSeeder: {$generadas} notas created across {$postulantes->count()} postulantes.");
    }
}
