<?php

namespace App\Http\Requests\Network;

class ReorderMonitoredServicesRequest extends NetworkRequest
{
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'integer', 'distinct'],
        ];
    }
}
