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
        return match ($this->route()->getName()) {
            'todo.canvas.store' => ['title' => ['required', 'string', 'max:40']],
            'todo.canvas.update' => ['title' => ['required', 'string', 'max:40']],
            'todo.list.store' => [
                'title' => ['required', 'string', 'max:60'],
                'color' => ['sometimes', 'required', 'string', 'max:50'],
            ],
            'todo.list.update' => [
                'title' => ['sometimes', 'required', 'string', 'max:60'],
                'color' => ['sometimes', 'required', 'string', 'max:50'],
                'is_collapsed' => ['sometimes', 'required', 'boolean'],
            ],
            'todo.list.move' => ['slot' => ['required', 'integer', 'between:0,15']],
            'todo.item.store' => ['text' => ['required', 'string', 'max:100']],
            'todo.item.update' => [
                'text' => ['sometimes', 'required', 'string', 'max:100'],
                'is_completed' => ['sometimes', 'required', 'boolean'],
            ],
            'todo.item.move' => [
                'list_id' => ['required', 'uuid'],
                'position' => ['required', 'integer', 'between:0,24'],
            ],
            'todo.list.reorder' => [
                'item_ids' => ['present', 'array', 'max:25'],
                'item_ids.*' => ['required', 'uuid', 'distinct'],
            ],
            default => [],
        };
    }
}
