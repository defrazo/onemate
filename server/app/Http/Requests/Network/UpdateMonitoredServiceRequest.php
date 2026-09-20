<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMonitoredServiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'url' => [
                'sometimes',
                'string',
                'max:2048',
                'url:http,https',
            ],
            'isActive' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
