<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Importacion extends Model
{
    protected $table = 'importaciones';

    protected $fillable = [
        'user_id',
        'tipo',
        'archivo',
        'total_filas',
        'exitosas',
        'fallidas',
        'errores',
        'finalizada',
    ];

    protected $casts = [
        'errores' => 'array',
        'total_filas' => 'integer',
        'exitosas' => 'integer',
        'fallidas' => 'integer',
        'finalizada' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
