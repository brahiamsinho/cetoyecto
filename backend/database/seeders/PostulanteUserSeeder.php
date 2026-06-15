<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Postulante;
use App\Services\UserService;
use Illuminate\Database\Seeder;

class PostulanteUserSeeder extends Seeder
{
    public function run(): void
    {
        $userService = app(UserService::class);

        Postulante::query()->get()->each(function (Postulante $postulante) use ($userService): void {
            $userService->syncPostulanteAccount($postulante);
        });
    }
}
