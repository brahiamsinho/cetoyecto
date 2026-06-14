<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Postulante extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ci',
        'nombres',
        'apellidos',
        'fecha_nacimiento',
        'sexo',
        'direccion',
        'telefono',
        'email',
        'colegio_procedencia',
        'ciudad',
        'carrera_primera_id',
        'carrera_segunda_id',
        'tiene_carnet_identidad',
        'tiene_foto',
        'tiene_diploma_bachiller',
        'gestion_id',
        'estado',
        'carrera_asignada_id',
        'user_id',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'tiene_carnet_identidad' => 'boolean',
        'tiene_foto' => 'boolean',
        'tiene_diploma_bachiller' => 'boolean',
        'titulo_bachiller' => 'boolean',
    ];

    protected $appends = ['promedio_final', 'estado_promedio'];

    public function carreraPrimera()
    {
        return $this->belongsTo(Carrera::class, 'carrera_primera_id');
    }

    public function carreraSegunda()
    {
        return $this->belongsTo(Carrera::class, 'carrera_segunda_id');
    }

    public function carreraAsignada()
    {
        return $this->belongsTo(Carrera::class, 'carrera_asignada_id');
    }

    public function gestion()
    {
        return $this->belongsTo(Gestion::class);
    }

    public function pago()
    {
        return $this->hasOne(Pago::class);
    }

    public function requisitos()
    {
        return $this->hasMany(RequisitoPostulante::class, 'postulante_id');
    }

    public function notas()
    {
        return $this->hasMany(Nota::class);
    }

    public function grupos()
    {
        return $this->belongsToMany(Grupo::class, 'grupo_postulante', 'postulante_id', 'grupo_id')
            ->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPromedioFinalAttribute(): ?float
    {
        if ($this->notas->isEmpty()) {
            return null;
        }

        $promedios = $this->notas->groupBy('materia_id')->map(function ($notas) {
            return $notas->avg('promedio');
        });

        if ($promedios->isEmpty()) {
            return null;
        }

        return round($promedios->avg(), 2);
    }

    public function getEstadoPromedioAttribute(): ?string
    {
        $promedio = $this->promedio_final;

        if (is_null($promedio)) {
            return null;
        }

        return $promedio >= 60 ? 'APROBADO' : 'REPROBADO';
    }
}
