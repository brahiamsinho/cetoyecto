<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Carrera;
use App\Models\Gestion;
use App\Models\Postulante;
use App\Services\PostulanteService;
use Illuminate\Database\Seeder;

class PostulanteSeeder extends Seeder
{
    public function run(): void
    {
        if (Postulante::count() >= 60) {
            $this->command->info('PostulanteSeeder: already enough postulantes, skipping creation.');
        } else {
            $service = app(PostulanteService::class);
            $service->generarAleatorios(60);
            $this->command->info('PostulanteSeeder: 60 postulantes created.');
        }

        $carreraIds = Carrera::pluck('id')->all();

        $sinSegunda = Postulante::whereNull('carrera_segunda_id')->get();

        foreach ($sinSegunda as $postulante) {
            $opciones = array_values(array_filter($carreraIds, fn ($id) => $id !== $postulante->carrera_primera_id));
            $postulante->carrera_segunda_id = $opciones[array_rand($opciones)];
            $postulante->saveQuietly();
        }

        $this->command->info("PostulanteSeeder: {$sinSegunda->count()} missing segunda opcion filled.");
    }
}
