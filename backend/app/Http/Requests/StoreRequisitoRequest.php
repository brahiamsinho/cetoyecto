<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequisitoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_requisito' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_requisito.required' => 'El tipo de requisito es obligatorio.',
            'tipo_requisito.max' => 'El tipo de requisito no debe exceder los 255 caracteres.',
        ];
    }
}
