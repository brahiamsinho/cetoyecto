<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Administrativo extends Model
{
    protected $table = 'administrativos';

    protected $fillable = [
        'user_id',
        'cargo',
        'facultad_id',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facultad()
    {
        return $this->belongsTo(Facultad::class);
    }
}
