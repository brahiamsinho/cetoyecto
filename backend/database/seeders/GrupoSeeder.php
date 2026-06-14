<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Services\GrupoService;
use Illuminate\Database\Seeder;
use Illuminate\Http\Request;

class GrupoSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(GrupoService::class);
        $grupos = $service->generarGrupos(new Request());

        $this->command->info("GrupoSeeder: {$grupos->count()} grupos generated.");
    }
}
