<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class CheckSslRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'host' => [
                'required',
                'string',
                'max:253',
            ],
        ];
    }
}
