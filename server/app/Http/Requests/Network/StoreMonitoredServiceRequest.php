<?php

namespace App\Http\Requests\Network;

use Illuminate\Validation\Rule;

class StoreMonitoredServiceRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['http', 'tcp'])],
            'name' => ['required', 'string', 'max:100'],

            'url' => [
                Rule::requiredIf($this->input('type') === 'http'),
                'nullable',
                'string',
                'max:2048',
                'url:http,https',
            ],

            'host' => [
                Rule::requiredIf($this->input('type') === 'tcp'),
                'nullable',
                'string',
                'max:253',
            ],

            'port' => [
                Rule::requiredIf($this->input('type') === 'tcp'),
                'nullable',
                'integer',
                'between:1,65535',
            ],
        ];
    }
}
