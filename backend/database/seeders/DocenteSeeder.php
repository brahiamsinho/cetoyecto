<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocenteSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('docentes')->count() > 0) {
            $this->command->info('DocenteSeeder: docentes already exist, skipping.');
            return;
        }

        $docentes = [
            [
                'ci'                          => '1234567',
                'nombres'                     => 'Carlos Alberto',
                'apellidos'                   => 'Mendoza Rojas',
                'email'                       => 'cmendoza@ficct.edu.bo',
                'telefono'                    => '70011001',
                'profesion'                   => 'Ingeniero en Sistemas',
                'maestria'                    => true,
                'diplomado_educacion_superior'=> true,
                'contratado'                  => true,
                'user_id'                     => null,
                'created_at'                  => now(),
                'updated_at'                  => now(),
            ],
            [
                'ci'                          => '2345678',
                'nombres'                     => 'María Elena',
                'apellidos'                   => 'Flores Gutierrez',
                'email'                       => 'mflores@ficct.edu.bo',
                'telefono'                    => '70022002',
                'profesion'                   => 'Licenciada en Matemáticas',
                'maestria'                    => true,
                'diplomado_educacion_superior'=> true,
                'contratado'                  => true,
                'user_id'                     => null,
                'created_at'                  => now(),
                'updated_at'                  => now(),
            ],
            [
                'ci'                          => '3456789',
                'nombres'                     => 'Roberto',
                'apellidos'                   => 'Vargas Pereira',
                'email'                       => 'rvargas@ficct.edu.bo',
                'telefono'                    => '70033003',
                'profesion'                   => 'Licenciado en Lingüística',
                'maestria'                    => false,
                'diplomado_educacion_superior'=> true,
                'contratado'                  => true,
                'user_id'                     => null,
                'created_at'                  => now(),
                'updated_at'                  => now(),
            ],
            [
                'ci'                          => '4567890',
                'nombres'                     => 'Ana Lucía',
                'apellidos'                   => 'Torres Salinas',
                'email'                       => 'atorres@ficct.edu.bo',
                'telefono'                    => '70044004',
                'profesion'                   => 'Ingeniera en Física',
                'maestria'                    => true,
                'diplomado_educacion_superior'=> true,
                'contratado'                  => true,
                'user_id'                     => null,
                'created_at'                  => now(),
                'updated_at'                  => now(),
            ],
        ];

        DB::table('docentes')->insert($docentes);

        $this->command->info('DocenteSeeder: 4 docentes created.');
    }
}
