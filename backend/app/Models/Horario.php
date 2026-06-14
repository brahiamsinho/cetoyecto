<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $table = 'horarios';

    protected $fillable = [
        'dia',
        'hora_inicio',
        'hora_fin',
        'turno',
    ];

    public function cargasHorarias()
    {
        return $this->hasMany(CargaHorariaDocente::class);
    }

    public function grupos()
    {
        return $this->hasManyThrough(
            Grupo::class,
            CargaHorariaDocente::class,
            'horario_id',
            'id',
            'id',
            'grupo_id'
        )->distinct();
    }
}
