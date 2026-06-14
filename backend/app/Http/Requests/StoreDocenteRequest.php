<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ci' => ['required', 'string', 'unique:docentes,ci'],
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:docentes,email'],
            'telefono' => ['nullable', 'string'],
            'profesion' => ['required', 'string'],
            'maestria' => ['boolean'],
            'diplomado_educacion_superior' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'ci.required' => 'El carnet de identidad es obligatorio.',
            'ci.unique' => 'El carnet de identidad ya está registrado.',
            'nombres.required' => 'Los nombres son obligatorios.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'profesion.required' => 'La profesión es obligatoria.',
        ];
    }
}
