<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    protected $table = 'docentes';

    protected $fillable = [
        'ci',
        'nombres',
        'apellidos',
        'email',
        'telefono',
        'profesion',
        'maestria',
        'diplomado_educacion_superior',
        'contratado',
        'user_id',
    ];

    protected $casts = [
        'maestria' => 'boolean',
        'diplomado_educacion_superior' => 'boolean',
        'contratado' => 'boolean',
    ];

    public function cargasHorarias()
    {
        return $this->hasMany(CargaHorariaDocente::class);
    }

    public function asistencias()
    {
        return $this->hasMany(AsistenciaDocente::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
