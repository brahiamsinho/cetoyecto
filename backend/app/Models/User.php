<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'rol_id',
        'name',
        'email',
        'password',
        'activo',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function bitacoras()
    {
        return $this->hasMany(Bitacora::class);
    }

    public function docente()
    {
        return $this->hasOne(Docente::class);
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class);
    }

    public function hasRole(string $role): bool
    {
        return $this->rol && strtolower($this->rol->nombre) === strtolower($role);
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->rol && in_array(strtolower($this->rol->nombre), array_map('strtolower', $roles));
    }
}
