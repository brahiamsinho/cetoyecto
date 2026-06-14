<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    protected $table = 'alumnos';

    protected $fillable = [
        'postulante_id',
        'user_id',
        'matricula',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function notas()
    {
        return $this->hasMany(Nota::class);
    }
}
