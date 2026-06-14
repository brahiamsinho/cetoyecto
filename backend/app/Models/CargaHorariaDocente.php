<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CargaHorariaDocente extends Model
{
    protected $table = 'carga_horaria_docente';

    protected $appends = [
        'horario_descripcion',
    ];

    protected $fillable = [
        'docente_id',
        'grupo_id',
        'materia_id',
        'aula_id',
        'horario_id',
    ];

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }

    public function horario()
    {
        return $this->belongsTo(Horario::class);
    }

    public function getHorarioDescripcionAttribute(): ?string
    {
        $horario = $this->relationLoaded('horario') ? $this->getRelation('horario') : $this->horario;

        if (! $horario) {
            return null;
        }

        $diasRepetidos = $this->resolverDiasRepetidos((string) $horario->dia);

        if ($diasRepetidos !== null) {
            return sprintf('%s %s-%s', $diasRepetidos, $horario->hora_inicio, $horario->hora_fin);
        }

        return sprintf('%s %s-%s', $horario->dia, $horario->hora_inicio, $horario->hora_fin);
    }

    private function resolverDiasRepetidos(string $dia): ?string
    {
        $normalizado = Str::ascii(Str::lower($dia));

        if (in_array($normalizado, ['lunes', 'miercoles', 'viernes'], true)) {
            return 'Lunes, Miércoles y Viernes';
        }

        if (in_array($normalizado, ['martes', 'jueves'], true)) {
            return 'Martes y Jueves';
        }

        if ($normalizado === 'sabado') {
            return 'Sábado';
        }

        return null;
    }
}
