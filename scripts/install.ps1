$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Check-Command($name) {
    if (!(Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] $name is not installed or not in PATH." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] $name found" -ForegroundColor Green
}

Write-Host "=== Checking prerequisites ===" -ForegroundColor Cyan
Check-Command "php"
Check-Command "composer"
Check-Command "node"

Write-Host "`n=== Installing backend dependencies ===" -ForegroundColor Cyan
Set-Location -LiteralPath "$root\backend"
composer install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env created from .env.example" -ForegroundColor Green
}

php artisan key:generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

php artisan migrate --seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Installing frontend dependencies ===" -ForegroundColor Cyan
Set-Location -LiteralPath "$root\frontend"
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Installation complete! ===" -ForegroundColor Green
Write-Host "Run 'scripts\start-dev.ps1' to start the development servers." -ForegroundColor Yellow
