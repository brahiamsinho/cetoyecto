<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocenteRequisito extends Model
{
    protected $table = 'docente_requisitos';
    protected $fillable = [
        'docente_id',
        'tipo_requisito',
        'cumplido',
        'archivo',
    ];

    protected $casts = [
        'cumplido' => 'boolean',
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }
}
