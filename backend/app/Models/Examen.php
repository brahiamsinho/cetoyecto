<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Examen extends Model
{
    protected $table = 'examenes';
    protected $fillable = [
        'postulante_id',
        'materia_id',
        'numero_examen',
        'nota',
    ];

    protected $casts = [
        'nota' => 'decimal:2',
    ];

    public function postulante(): BelongsTo
    {
        return $this->belongsTo(Postulante::class);
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}
