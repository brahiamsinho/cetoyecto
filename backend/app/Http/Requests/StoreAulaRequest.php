<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAulaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'codigo' => is_string($this->codigo) ? trim($this->codigo) : $this->codigo,
            'nombre' => is_string($this->nombre) ? trim($this->nombre) : $this->nombre,
            'ubicacion' => is_string($this->ubicacion) ? trim($this->ubicacion) : $this->ubicacion,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'unique:aulas,codigo'],
            'nombre' => ['required', 'string'],
            'capacidad' => ['required', 'integer', 'min:1'],
            'ubicacion' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El código del aula es obligatorio.',
            'codigo.unique' => 'El código del aula ya existe.',
            'nombre.required' => 'El nombre del aula es obligatorio.',
            'capacidad.required' => 'La capacidad es obligatoria.',
            'capacidad.integer' => 'La capacidad debe ser un número entero.',
            'capacidad.min' => 'La capacidad debe ser al menos 1.',
        ];
    }
}
