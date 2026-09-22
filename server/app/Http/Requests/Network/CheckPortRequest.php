<?php

namespace App\Http\Requests\Network;

class CheckPortRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'host' => ['required', 'string', 'max:253'],
            'port' => ['required', 'integer', 'between:1,65535'],
        ];
    }
}
