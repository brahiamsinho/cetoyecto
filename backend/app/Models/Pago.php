<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $fillable = [
        'postulante_id',
        'monto',
        'codigo_transaccion',
        'estado',
        'fecha_pago',
        'metodo_pago',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class);
    }
}
