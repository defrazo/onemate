<?php

namespace App\Http\Requests\Assistant;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role !== 'demo';
    }

    public function rules(): array
    {
        return [
            'request_id' => ['required', 'uuid'],
            'conversation_id' => ['present', 'nullable', 'uuid'],
            'mode' => ['required', 'in:ask,explain,improve,translate,ideas'],
            'content' => ['required', 'string', 'max:4000'],
            'search_enabled' => ['sometimes', 'boolean'],
        ];
    }
}
