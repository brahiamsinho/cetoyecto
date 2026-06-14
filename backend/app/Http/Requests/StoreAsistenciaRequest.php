<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\CargaHorariaDocente;
use Illuminate\Foundation\Http\FormRequest;

class StoreAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'docente_id' => ['required', 'exists:docentes,id'],
            'grupo_id' => ['required', 'exists:grupos,id'],
            'materia_id' => ['required', 'exists:materias,id'],
            'horario_id' => ['required', 'exists:horarios,id'],
            'fecha' => ['required', 'date'],
            'estado' => ['required', 'in:presente,atraso,falta,justificado'],
            'observaciones' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $existeAsignacion = CargaHorariaDocente::where('docente_id', $this->docente_id)
                ->where('grupo_id', $this->grupo_id)
                ->where('materia_id', $this->materia_id)
                ->where('horario_id', $this->horario_id)
                ->exists();

            if (!$existeAsignacion) {
                $validator->errors()->add('docente_id', 'El docente no está asignado a este grupo, materia y horario.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'docente_id.required' => 'El docente es obligatorio.',
            'docente_id.exists' => 'El docente seleccionado no es válido.',
            'grupo_id.required' => 'El grupo es obligatorio.',
            'grupo_id.exists' => 'El grupo seleccionado no es válido.',
            'materia_id.required' => 'La materia es obligatoria.',
            'materia_id.exists' => 'La materia seleccionada no es válida.',
            'horario_id.required' => 'El horario es obligatorio.',
            'horario_id.exists' => 'El horario seleccionado no es válido.',
            'fecha.required' => 'La fecha es obligatoria.',
            'fecha.date' => 'La fecha debe ser una fecha válida.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado debe ser: presente, atraso, falta o justificado.',
        ];
    }
}
