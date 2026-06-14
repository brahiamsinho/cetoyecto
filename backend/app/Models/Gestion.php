<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gestion extends Model
{
    protected $table = 'gestiones';
    protected $fillable = [
        'anio',
        'periodo',
        'activa',
    ];

    protected $casts = [
        'anio' => 'integer',
        'activa' => 'boolean',
    ];

    public function postulantes()
    {
        return $this->hasMany(Postulante::class);
    }
}
