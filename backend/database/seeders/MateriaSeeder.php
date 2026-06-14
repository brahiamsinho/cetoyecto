<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Materia;
use Illuminate\Database\Seeder;

class MateriaSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            ['codigo' => 'COM-101', 'nombre' => 'Computación', 'descripcion' => 'Fundamentos de computación y programación.'],
            ['codigo' => 'MAT-101', 'nombre' => 'Matemáticas', 'descripcion' => 'Matemáticas básicas y álgebra.'],
            ['codigo' => 'ING-101', 'nombre' => 'Inglés', 'descripcion' => 'Inglés técnico y comunicación.'],
            ['codigo' => 'FIS-101', 'nombre' => 'Física', 'descripcion' => 'Física general y mecánica.'],
        ];

        foreach ($materias as $materia) {
            Materia::firstOrCreate(['codigo' => $materia['codigo']], $materia);
        }
    }
}
