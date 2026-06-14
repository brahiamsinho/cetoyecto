<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrera extends Model
{
    protected $table = 'carreras';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'cupo_maximo',
        'cupo_actual',
        'activo',
    ];

    protected $casts = [
        'cupo_maximo' => 'integer',
        'cupo_actual' => 'integer',
        'activo' => 'boolean',
    ];

    public function postulantesPrimera()
    {
        return $this->hasMany(Postulante::class, 'carrera_primera_id');
    }

    public function postulantesSegunda()
    {
        return $this->hasMany(Postulante::class, 'carrera_segunda_id');
    }

    public function postulantesAsignados()
    {
        return $this->hasMany(Postulante::class, 'carrera_asignada_id');
    }

    public function getCupoDisponibleAttribute(): int
    {
        return $this->cupo_maximo - $this->cupo_actual;
    }
}
