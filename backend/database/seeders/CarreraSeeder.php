<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Carrera;
use Illuminate\Database\Seeder;

class CarreraSeeder extends Seeder
{
    public function run(): void
    {
        $carreras = [
            [
                'codigo' => 'SIS',
                'nombre' => 'Ingeniería de Sistemas',
                'descripcion' => 'Formación en diseño, implementación y gestión de sistemas de información.',
                'cupo_maximo' => 100,
            ],
            [
                'codigo' => 'INF',
                'nombre' => 'Ingeniería en Informática',
                'descripcion' => 'Formación en fundamentos teóricos y prácticos de la computación.',
                'cupo_maximo' => 100,
            ],
            [
                'codigo' => 'RED',
                'nombre' => 'Ingeniería en Redes y Telecomunicaciones',
                'descripcion' => 'Formación en diseño, implementación y administración de redes de comunicación.',
                'cupo_maximo' => 100,
            ],
            [
                'codigo' => 'ROB',
                'nombre' => 'Robótica',
                'descripcion' => 'Formación en robótica, automatización y sistemas inteligentes.',
                'cupo_maximo' => 100,
            ],
        ];

        foreach ($carreras as $carrera) {
            Carrera::firstOrCreate(['codigo' => $carrera['codigo']], $carrera);
        }
    }
}
