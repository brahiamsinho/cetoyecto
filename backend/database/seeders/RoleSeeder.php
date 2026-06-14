<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'CPD', 'descripcion' => 'Comité de Programación Docente'],
            ['nombre' => 'Jefatura de Carrera', 'descripcion' => 'Jefe o Jefa de carrera'],
            ['nombre' => 'Autoridad/Decanato', 'descripcion' => 'Autoridad del Decanato'],
            ['nombre' => 'Docente', 'descripcion' => 'Docente de la universidad'],
            ['nombre' => 'Postulante', 'descripcion' => 'Postulante del sistema'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['nombre' => $role['nombre']], $role);
        }
    }
}
