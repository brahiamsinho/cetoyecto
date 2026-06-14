<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Aula;
use Illuminate\Database\Seeder;

class AulaSeeder extends Seeder
{
    public function run(): void
    {
        $aulas = [
            ['codigo' => 'A-101', 'nombre' => 'Aula 101', 'capacidad' => 40, 'ubicacion' => 'Piso 1'],
            ['codigo' => 'A-102', 'nombre' => 'Aula 102', 'capacidad' => 35, 'ubicacion' => 'Piso 1'],
            ['codigo' => 'A-103', 'nombre' => 'Aula 103', 'capacidad' => 30, 'ubicacion' => 'Piso 1'],
            ['codigo' => 'A-104', 'nombre' => 'Aula 104', 'capacidad' => 45, 'ubicacion' => 'Piso 1'],
            ['codigo' => 'B-201', 'nombre' => 'Aula 201', 'capacidad' => 50, 'ubicacion' => 'Piso 2'],
            ['codigo' => 'B-202', 'nombre' => 'Aula 202', 'capacidad' => 30, 'ubicacion' => 'Piso 2'],
            ['codigo' => 'B-203', 'nombre' => 'Aula 203', 'capacidad' => 35, 'ubicacion' => 'Piso 2'],
            ['codigo' => 'B-204', 'nombre' => 'Aula 204', 'capacidad' => 40, 'ubicacion' => 'Piso 2'],
            ['codigo' => 'C-301', 'nombre' => 'Aula 301', 'capacidad' => 100, 'ubicacion' => 'Piso 3'],
            ['codigo' => 'C-302', 'nombre' => 'Aula 302', 'capacidad' => 45, 'ubicacion' => 'Piso 3'],
            ['codigo' => 'C-303', 'nombre' => 'Aula 303', 'capacidad' => 35, 'ubicacion' => 'Piso 3'],
            ['codigo' => 'C-304', 'nombre' => 'Aula 304', 'capacidad' => 30, 'ubicacion' => 'Piso 3'],
        ];

        foreach ($aulas as $aula) {
            Aula::updateOrCreate(['codigo' => $aula['codigo']], $aula);
        }
    }
}
