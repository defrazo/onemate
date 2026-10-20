<?php

namespace App\Http\Requests\Network;

use Illuminate\Validation\Rule;

class CheckServiceRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'max:2048', 'url:http,https'],
            'checkVia' => ['sometimes', Rule::in(['direct', 'proxy'])],
        ];
    }
}
