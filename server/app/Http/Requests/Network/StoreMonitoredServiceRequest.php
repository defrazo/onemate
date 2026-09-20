<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class StoreMonitoredServiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'url' => [
                'required',
                'string',
                'max:2048',
                'url:http,https',
            ],
        ];
    }
}
