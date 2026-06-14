<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'materia_id' => ['required', 'exists:materias,id'],
            'nota1' => ['required', 'numeric', 'min:0', 'max:100'],
            'nota2' => ['required', 'numeric', 'min:0', 'max:100'],
            'nota3' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'materia_id.required' => 'La materia es obligatoria.',
            'materia_id.exists' => 'La materia seleccionada no es válida.',
            'nota1.required' => 'La nota 1 es obligatoria.',
            'nota1.numeric' => 'La nota 1 debe ser un valor numérico.',
            'nota1.min' => 'La nota 1 debe ser al menos 0.',
            'nota1.max' => 'La nota 1 no debe exceder 100.',
            'nota2.required' => 'La nota 2 es obligatoria.',
            'nota2.numeric' => 'La nota 2 debe ser un valor numérico.',
            'nota2.min' => 'La nota 2 debe ser al menos 0.',
            'nota2.max' => 'La nota 2 no debe exceder 100.',
            'nota3.required' => 'La nota 3 es obligatoria.',
            'nota3.numeric' => 'La nota 3 debe ser un valor numérico.',
            'nota3.min' => 'La nota 3 debe ser al menos 0.',
            'nota3.max' => 'La nota 3 no debe exceder 100.',
        ];
    }
}
