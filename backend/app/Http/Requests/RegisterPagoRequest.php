<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterPagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto' => ['required', 'numeric', 'min:0'],
            'metodo_pago' => ['nullable', 'string'],
            'stripe_payment_intent_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'monto.required' => 'El monto es obligatorio.',
            'monto.numeric' => 'El monto debe ser un valor numérico.',
            'monto.min' => 'El monto debe ser mayor o igual a 0.',
        ];
    }
}
