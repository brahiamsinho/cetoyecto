<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostulanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postulanteId = $this->route('postulante');

        return [
            'ci' => ['required', 'string', "unique:postulantes,ci,{$postulanteId}", 'regex:/^[0-9]+$/'],
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'fecha_nacimiento' => ['required', 'date', 'before:2008-01-01'],
            'sexo' => ['required', 'in:M,F'],
            'direccion' => ['nullable', 'string'],
            'telefono' => ['nullable', 'string'],
            'email' => ['required', 'email', "unique:postulantes,email,{$postulanteId}"],
            'colegio_procedencia' => ['required', 'string'],
            'ciudad' => ['required', 'string'],
            'carrera_primera_id' => ['required', 'exists:carreras,id'],
            'carrera_segunda_id' => ['nullable', 'exists:carreras,id', 'different:carrera_primera_id'],
            'gestion_id' => ['required', 'exists:gestiones,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ci.required' => 'El carnet de identidad es obligatorio.',
            'ci.unique' => 'El carnet de identidad ya está registrado.',
            'ci.regex' => 'El carnet de identidad debe contener solo números.',
            'nombres.required' => 'Los nombres son obligatorios.',
            'nombres.max' => 'Los nombres no deben exceder los 255 caracteres.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.max' => 'Los apellidos no deben exceder los 255 caracteres.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'fecha_nacimiento.before' => 'El postulante debe ser mayor de 18 años.',
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.in' => 'El sexo debe ser M o F.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'colegio_procedencia.required' => 'El colegio de procedencia es obligatorio.',
            'ciudad.required' => 'La ciudad es obligatoria.',
            'carrera_primera_id.required' => 'La primera opción de carrera es obligatoria.',
            'carrera_primera_id.exists' => 'La primera opción de carrera no es válida.',
            'carrera_segunda_id.exists' => 'La segunda opción de carrera no es válida.',
            'carrera_segunda_id.different' => 'La segunda opción debe ser diferente a la primera.',
            'gestion_id.required' => 'La gestión es obligatoria.',
            'gestion_id.exists' => 'La gestión seleccionada no es válida.',
        ];
    }
}
