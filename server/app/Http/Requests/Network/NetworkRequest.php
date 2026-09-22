<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

abstract class NetworkRequest extends FormRequest
{
    public function messages(): array
    {
        return [
            'url.url' => 'Укажите корректный адрес',
            'port.integer' => 'Укажите корректный порт',
            'port.between' => 'Порт должен быть от 1 до 65535',
        ];
    }
}
