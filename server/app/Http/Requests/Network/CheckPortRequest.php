<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class CheckPortRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'host' => [
                'required',
                'string',
                'max:253',
            ],
            'port' => [
                'required',
                'integer',
                'between:1,65535',
            ],
        ];
    }
}
