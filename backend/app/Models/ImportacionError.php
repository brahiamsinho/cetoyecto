<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacionError extends Model
{
    protected $table = 'importacion_errores';

    protected $fillable = [
        'importacion_id',
        'fila',
        'campo',
        'error',
    ];

    protected $casts = [
        'fila' => 'integer',
    ];

    public function importacion(): BelongsTo
    {
        return $this->belongsTo(Importacion::class);
    }
}
