<?php

namespace App\Http\Requests\Network;

use Illuminate\Validation\Rule;

class UpdateMonitoredServiceRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['http', 'tcp'])],
            'name' => ['sometimes', 'string', 'max:100'],
            'url' => ['sometimes', 'string', 'max:2048', 'url:http,https'],
            'host' => ['sometimes', 'string', 'max:253'],
            'port' => ['sometimes', 'integer', 'between:1,65535'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
