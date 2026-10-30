<?php

namespace App\Http\Requests\Todo;

use Illuminate\Foundation\Http\FormRequest;

class TodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return match ($this->route()->getActionMethod()) {
            'storeCanvas' => ['title' => ['required', 'string', 'max:40']],
            'updateCanvas' => ['title' => ['required', 'string', 'max:40']],
            'storeList' => [
                'title' => ['required', 'string', 'max:60'],
                'color' => ['sometimes', 'required', 'string', 'max:50'],
            ],
            'updateList' => [
                'title' => ['sometimes', 'required', 'string', 'max:60'],
                'color' => ['sometimes', 'required', 'string', 'max:50'],
                'is_collapsed' => ['sometimes', 'required', 'boolean'],
            ],
            'moveList' => ['slot' => ['required', 'integer', 'between:0,15']],
            'storeItem' => ['text' => ['required', 'string', 'max:100']],
            'updateItem' => [
                'text' => ['sometimes', 'required', 'string', 'max:100'],
                'is_completed' => ['sometimes', 'required', 'boolean'],
            ],
            'moveItem' => [
                'list_id' => ['required', 'uuid'],
                'position' => ['required', 'integer', 'between:0,24'],
            ],
            'reorderItems' => [
                'item_ids' => ['present', 'array', 'max:25'],
                'item_ids.*' => ['required', 'uuid', 'distinct'],
            ],
            default => [],
        };
    }
}
