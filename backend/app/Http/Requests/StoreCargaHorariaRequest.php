<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\CargaHorariaDocente;
use App\Models\Docente;
use Illuminate\Foundation\Http\FormRequest;

class StoreCargaHorariaRequest extends FormRequest
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
            'aula_id' => ['required', 'exists:aulas,id'],
            'horario_id' => ['required', 'exists:horarios,id'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $docente = Docente::find($this->docente_id);
            $horarioId = $this->horario_id;
            $aulaId = $this->aula_id;

            if ($docente) {
                $gruposAsignados = CargaHorariaDocente::where('docente_id', $docente->id)->count();

                if ($gruposAsignados >= 4) {
                    $validator->errors()->add('docente_id', 'El docente ya tiene asignados 4 grupos (máximo permitido).');
                }

                $conflictoHorario = CargaHorariaDocente::where('docente_id', $docente->id)
                    ->where('horario_id', $horarioId)
                    ->exists();

                if ($conflictoHorario) {
                    $validator->errors()->add('horario_id', 'El docente ya tiene una asignación en este horario.');
                }
            }

            $conflictoAula = CargaHorariaDocente::where('aula_id', $aulaId)
                ->where('horario_id', $horarioId)
                ->exists();

            if ($conflictoAula) {
                $validator->errors()->add('aula_id', 'El aula ya está ocupada en este horario.');
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
            'aula_id.required' => 'El aula es obligatoria.',
            'aula_id.exists' => 'El aula seleccionada no es válida.',
            'horario_id.required' => 'El horario es obligatorio.',
            'horario_id.exists' => 'El horario seleccionado no es válido.',
        ];
    }
}
