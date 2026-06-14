<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Docente;
use App\Models\Postulante;
use App\Models\Role;
use App\Services\UserService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillLoginUsersCommand extends Command
{
    protected $signature = 'users:backfill-login {--chunk=200 : Records per batch}';

    protected $description = 'Backfill login-capable users for existing docentes and postulantes.';

    public function handle(UserService $userService): int
    {
        $docenteRole = Role::firstOrCreate(
            ['nombre' => 'Docente'],
            ['descripcion' => 'Docente de la universidad']
        );

        $postulanteRole = Role::firstOrCreate(
            ['nombre' => 'Postulante'],
            ['descripcion' => 'Postulante del sistema']
        );

        $chunkSize = max(1, (int) $this->option('chunk'));
        $docentesSynced = 0;
        $postulantesSynced = 0;

        DB::transaction(function () use ($userService, $chunkSize, &$docentesSynced, &$postulantesSynced): void {
            Docente::query()->orderBy('id')->chunkById($chunkSize, function ($docentes) use ($userService, &$docentesSynced): void {
                foreach ($docentes as $docente) {
                    $userService->syncDocenteAccount($docente);
                    $docentesSynced++;
                }
            });

            Postulante::query()->orderBy('id')->chunkById($chunkSize, function ($postulantes) use ($userService, &$postulantesSynced): void {
                foreach ($postulantes as $postulante) {
                    $userService->syncPostulanteAccount($postulante);
                    $postulantesSynced++;
                }
            });
        });

        $this->info(sprintf(
            'Backfill complete: %d docentes and %d postulantes synced. Roles ensured: %s, %s.',
            $docentesSynced,
            $postulantesSynced,
            $docenteRole->nombre,
            $postulanteRole->nombre
        ));

        return self::SUCCESS;
    }
}
