<?php

namespace App\Http\Requests\Network;

class CheckServiceRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'max:2048', 'url:http,https'],
        ];
    }
}
