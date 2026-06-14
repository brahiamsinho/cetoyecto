<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsistenciaDocente extends Model
{
    protected $table = 'asistencias_docentes';

    protected $fillable = [
        'docente_id',
        'grupo_id',
        'materia_id',
        'horario_id',
        'fecha',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class);
    }
}
