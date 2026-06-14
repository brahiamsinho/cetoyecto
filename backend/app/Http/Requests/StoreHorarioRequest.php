<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHorarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dia' => ['required', 'string'],
            'hora_inicio' => ['required', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'hora_fin' => ['required', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', 'after:hora_inicio'],
            'turno' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'dia.required' => 'El día es obligatorio.',
            'hora_inicio.required' => 'La hora de inicio es obligatoria.',
            'hora_inicio.regex' => 'La hora de inicio debe tener el formato HH:MM (ej: 07:00 o 14:30).',
            'hora_fin.required' => 'La hora de fin es obligatoria.',
            'hora_fin.regex' => 'La hora de fin debe tener el formato HH:MM (ej: 07:00 o 14:30).',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
            'turno.required' => 'El turno es obligatorio.',
        ];
    }
}
