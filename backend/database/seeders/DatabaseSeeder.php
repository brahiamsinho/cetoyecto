<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CarreraSeeder::class,
            MateriaSeeder::class,
            AulaSeeder::class,
            HorarioSeeder::class,
            GestionSeeder::class,
            FacultadSeeder::class,
            PostulanteSeeder::class,
            NotaSeeder::class,
            GrupoSeeder::class,
            DocenteSeeder::class,
            DocenteUserSeeder::class,
            PostulanteUserSeeder::class,
            CargaHorariaSeeder::class,
            AsistenciasSeeder::class,
        ]);
    }
}
