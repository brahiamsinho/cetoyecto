<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Facultad;
use Illuminate\Database\Seeder;

class FacultadSeeder extends Seeder
{
    public function run(): void
    {
        $facultades = [
            [
                'codigo' => 'FICCT',
                'nombre' => 'Facultad de Ingeniería y Ciencias de la Computación',
                'capacidad_grupo' => 30,
                'cupo_sistemas' => 100,
                'cupo_informatica' => 80,
                'cupo_redes' => 80,
                'cupo_robotica' => 60,
            ],
        ];

        foreach ($facultades as $facultad) {
            Facultad::firstOrCreate(['codigo' => $facultad['codigo']], $facultad);
        }
    }
}
