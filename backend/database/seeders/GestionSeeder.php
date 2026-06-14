<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Gestion;
use Illuminate\Database\Seeder;

class GestionSeeder extends Seeder
{
    public function run(): void
    {
        Gestion::firstOrCreate(
            ['anio' => 2026, 'periodo' => '2'],
            [
                'anio' => 2026,
                'periodo' => '2',
                'activa' => true,
            ]
        );
    }
}
