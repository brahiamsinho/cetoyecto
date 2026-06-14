<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    protected $table = 'aulas';

    protected $fillable = [
        'codigo',
        'nombre',
        'capacidad',
        'ubicacion',
    ];

    protected $casts = [
        'capacidad' => 'integer',
    ];

    public function cargasHorarias()
    {
        return $this->hasMany(CargaHorariaDocente::class);
    }
}
