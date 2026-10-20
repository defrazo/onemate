<?php

namespace App\Http\Requests\Network;

use Illuminate\Validation\Rule;

class CheckPortRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'host' => ['required', 'string', 'max:253'],
            'port' => ['required', 'integer', 'between:1,65535'],
            'checkVia' => ['sometimes', Rule::in(['direct', 'proxy'])],
        ];
    }
}
