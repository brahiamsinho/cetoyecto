<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $table = 'grupos';

    protected $fillable = [
        'codigo',
        'nombre',
        'gestion_id',
        'facultad_id',
    ];

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'grupo_materia', 'grupo_id', 'materia_id')
            ->withTimestamps();
    }

    public function postulantes()
    {
        return $this->belongsToMany(Postulante::class, 'grupo_postulante', 'grupo_id', 'postulante_id')
            ->withTimestamps();
    }

    public function docentes()
    {
        return $this->belongsToMany(Docente::class, 'documento_docente_grupo', 'grupo_id', 'docente_id')
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

    public function gestion()
    {
        return $this->belongsTo(Gestion::class);
    }
}
