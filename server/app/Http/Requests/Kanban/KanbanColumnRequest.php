<?php

namespace App\Http\Requests\Kanban;

use Illuminate\Foundation\Http\FormRequest;

class KanbanColumnRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user) {
            return false;
        }

        $board = $user->ownedKanbanBoards()->findOrFail($this->route('board'));

        if ($column = $this->route('column')) {
            $board->columns()->findOrFail($column);
        }

        return true;
    }

    public function rules(): array
    {
        $revision = ['revision' => ['required', 'integer', 'min:0']];

        return $revision + match ($this->route()->getActionMethod()) {
            'store' => [
                'title' => ['required', 'string', 'max:20'],
                'task_limit' => ['nullable', 'integer', 'min:1'],
                'position' => ['required', 'numeric', 'between:-99999999.9999,99999999.9999'],
                'color' => ['nullable', 'string', 'max:50'],
            ],
            'update' => [
                'title' => ['sometimes', 'required', 'string', 'max:20'],
                'task_limit' => ['sometimes', 'nullable', 'integer', 'min:1'],
                'position' => ['sometimes', 'numeric', 'between:-99999999.9999,99999999.9999'],
                'color' => ['sometimes', 'nullable', 'string', 'max:50'],
            ],
            'reorder' => [
                'column_ids' => ['required', 'array', 'list', 'min:1'],
                'column_ids.*' => ['required', 'uuid', 'distinct'],
            ],
            default => [],
        };
    }
}
