<?php

namespace App\Http\Requests\Network;

class CheckSslRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'host' => ['required', 'string', 'max:253'],
        ];
    }
}
