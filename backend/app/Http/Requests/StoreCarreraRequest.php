<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'unique:carreras,codigo'],
            'nombre' => ['required', 'string', 'unique:carreras,nombre'],
            'description' => ['nullable', 'string'],
            'cupo_maximo' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El código de la carrera es obligatorio.',
            'codigo.unique' => 'El código de la carrera ya existe.',
            'nombre.required' => 'El nombre de la carrera es obligatorio.',
            'nombre.unique' => 'El nombre de la carrera ya existe.',
            'cupo_maximo.required' => 'El cupo máximo es obligatorio.',
            'cupo_maximo.integer' => 'El cupo máximo debe ser un número entero.',
            'cupo_maximo.min' => 'El cupo máximo debe ser al menos 1.',
        ];
    }
}
