<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReporteIa extends Model
{
    protected $table = 'reportes_ia';

    protected $fillable = [
        'user_id',
        'prompt_usuario',
        'titulo',
        'resumen',
        'columnas',
        'filas',
        'conclusiones',
        'archivo_pdf',
        'archivo_excel',
    ];

    protected $casts = [
        'columnas' => 'array',
        'filas' => 'array',
        'conclusiones' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
