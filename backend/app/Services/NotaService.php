<?php

declare(strict_types=1);

namespace App\Services;

class NotaService
{
    public function calcularPromedio(float $nota1, float $nota2, float $nota3): float
    {
        return round(($nota1 + $nota2 + $nota3) / 3, 2);
    }

    public function determinarEstado(float $promedioFinal): string
    {
        return $promedioFinal >= 60 ? 'APROBADO' : 'REPROBADO';
    }
}
