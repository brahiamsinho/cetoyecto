$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Starting backend ===" -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath "$using:root\backend"
    php artisan serve
}

Write-Host "=== Starting frontend ===" -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath "$using:root\frontend"
    npm run dev
}

Write-Host "`n=== Development servers running ===" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop both servers.`n" -ForegroundColor Gray

try {
    while ($true) {
        $running = @(
            if ($backendJob.State -eq 'Running') { 'Backend' }
            if ($frontendJob.State -eq 'Running') { 'Frontend' }
        )
        if ($running.Count -eq 0) { break }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Cyan
    $backendJob, $frontendJob | Stop-Job -PassThru | Remove-Job
    Write-Host "Servers stopped." -ForegroundColor Green
}
