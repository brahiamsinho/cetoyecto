<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    protected $fillable = [
        'postulante_id',
        'materia_id',
        'nota1',
        'nota2',
        'nota3',
        'promedio',
    ];

    protected $casts = [
        'nota1' => 'decimal:2',
        'nota2' => 'decimal:2',
        'nota3' => 'decimal:2',
        'promedio' => 'decimal:2',
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class);
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }
}
