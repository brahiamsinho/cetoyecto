<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Docente;
use App\Services\UserService;
use Illuminate\Database\Seeder;

class DocenteUserSeeder extends Seeder
{
    public function run(): void
    {
        $userService = app(UserService::class);

        Docente::query()->get()->each(function (Docente $docente) use ($userService): void {
            $userService->syncDocenteAccount($docente);
        });
    }
}
