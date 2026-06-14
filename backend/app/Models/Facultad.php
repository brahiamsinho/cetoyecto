<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facultad extends Model
{
    protected $table = 'facultades';

    protected $fillable = [
        'codigo',
        'nombre',
        'capacidad_grupo',
        'cupo_sistemas',
        'cupo_informatica',
        'cupo_redes',
        'cupo_robotica',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad_grupo' => 'integer',
    ];

    public function administrativos()
    {
        return $this->hasMany(Administrativo::class);
    }

    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }
}
