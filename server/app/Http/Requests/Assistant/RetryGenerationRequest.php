<?php

namespace App\Http\Requests\Assistant;

use Illuminate\Foundation\Http\FormRequest;

class RetryGenerationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role !== 'demo';
    }

    public function rules(): array
    {
        return [
            'request_id' => ['required', 'uuid'],
        ];
    }
}
