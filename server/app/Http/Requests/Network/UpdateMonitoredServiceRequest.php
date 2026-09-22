<?php

namespace App\Http\Requests\Network;

class UpdateMonitoredServiceRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'url' => ['sometimes', 'string', 'max:2048', 'url:http,https'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
