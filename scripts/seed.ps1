$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Set-Location -LiteralPath "$root\backend"

Write-Host "=== Resetting database and running seeders ===" -ForegroundColor Cyan
php artisan migrate:fresh --seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "=== Creating default admin user ===" -ForegroundColor Cyan
php artisan tinker --execute="
    \$user = App\Models\User::firstOrCreate(
        ['email' => 'admin@cupficct.com'],
        [
            'name' => 'Admin',
            'password' => bcrypt('password'),
            'is_admin' => true,
        ]
    );
    echo 'Admin user ready (admin@cupficct.com / password)' . PHP_EOL;
"
