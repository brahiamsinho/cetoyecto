<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    protected $table = 'materias';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
    ];

    public function notas()
    {
        return $this->hasMany(Nota::class);
    }

    public function grupos()
    {
        return $this->belongsToMany(Grupo::class, 'grupo_materia', 'materia_id', 'grupo_id')
            ->withTimestamps();
    }

    public function cargasHorarias()
    {
        return $this->hasMany(CargaHorariaDocente::class);
    }

    public function asistencias()
    {
        return $this->hasMany(AsistenciaDocente::class);
    }
}
