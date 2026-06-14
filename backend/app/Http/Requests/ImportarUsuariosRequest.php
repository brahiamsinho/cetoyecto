<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportarUsuariosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo' => ['required', 'file', 'extensions:csv,xlsx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'El archivo es obligatorio.',
            'archivo.file' => 'Debe enviar un archivo válido.',
            'archivo.extensions' => 'El archivo debe tener extensión .csv o .xlsx.',
            'archivo.max' => 'El archivo no debe superar los 10 MB.',
        ];
    }
}
