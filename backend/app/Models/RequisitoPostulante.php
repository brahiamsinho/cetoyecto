<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequisitoPostulante extends Model
{
    protected $table = 'requisitos_postulantes';

    protected $fillable = [
        'postulante_id',
        'tipo_requisito',
        'cumplido',
        'observaciones',
    ];

    protected $casts = [
        'cumplido' => 'boolean',
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class);
    }
}
