<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

abstract class NetworkRequest extends FormRequest
{
    public function messages(): array
    {
        return [
            'type.required' => 'Выберите тип мониторинга',
            'type.in' => 'Некорректный тип мониторинга',

            'url.required' => 'Укажите адрес',
            'url.url' => 'Укажите корректный адрес',

            'host.required' => 'Укажите хост',

            'port.required' => 'Укажите порт',
            'port.integer' => 'Укажите корректный порт',
            'port.between' => 'Порт должен быть от 1 до 65535',
        ];
    }
}
