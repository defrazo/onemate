<?php

namespace App\Http\Requests\Kanban;

use App\Models\Kanban\KanbanTask;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KanbanTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user) {
            return false;
        }

        $board = $user->ownedKanbanBoards()->findOrFail($this->route('board'));

        if ($this->route('task') !== null) {
            KanbanTask::whereHas('column', fn ($query) => $query->where('board_id', $board->id))
                ->findOrFail($this->route('task'));
        }

        return true;
    }

    public function rules(): array
    {
        $revision = ['revision' => ['required', 'integer', 'min:0']];
        $position = ['required', 'numeric', 'between:-99999999.9999,99999999.9999'];

        $columnId = [
            'required',
            'uuid',
            Rule::exists('kanban_columns', 'id')
                ->where('board_id', $this->route('board')),
        ];

        $fields = [
            'column_id' => $columnId,
            'title' => ['required', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:300'],
            'status' => ['nullable', 'string', Rule::in(['active', 'paused', 'waiting'])],
            'priority' => ['nullable', 'string', Rule::in(['low', 'medium', 'high'])],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'remind_before_days' => ['nullable', 'integer', Rule::in([0, 1, 2, 3, 7])],
            'position' => $position,
            'completed' => ['required', 'boolean'],
        ];

        if ($this->route()->getActionMethod() === 'update') {
            $fields = array_map(fn ($rules) => ['sometimes', ...$rules], $fields);
        }

        return $revision + match ($this->route()->getActionMethod()) {
            'store', 'update' => $fields,
            'move' => [
                'column_id' => $columnId,
                'position' => $position,
            ],
            default => [],
        };
    }
}
