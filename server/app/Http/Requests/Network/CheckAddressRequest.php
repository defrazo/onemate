<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class CheckAddressRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'url' => [
                'required',
                'string',
                'max:2048',
                'url:http,https',
            ],
        ];
    }
}
