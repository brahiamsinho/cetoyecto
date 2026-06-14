<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMateriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'unique:materias,codigo'],
            'nombre' => ['required', 'string', 'unique:materias,nombre'],
            'descripcion' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El código de la materia es obligatorio.',
            'codigo.unique' => 'El código de la materia ya existe.',
            'nombre.required' => 'El nombre de la materia es obligatorio.',
            'nombre.unique' => 'El nombre de la materia ya existe.',
        ];
    }
}
