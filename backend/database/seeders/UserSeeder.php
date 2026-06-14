<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $rolCpd = Role::where('nombre', 'CPD')->first();

        if ($rolCpd) {
            User::firstOrCreate(
                ['email' => 'admin@ficct.edu.bo'],
                [
                    'rol_id' => $rolCpd->id,
                    'name' => 'Administrador CPD',
                    'email' => 'admin@ficct.edu.bo',
                    'password' => Hash::make('password'),
                    'activo' => true,
                ]
            );
        }
    }
}
