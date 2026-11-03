<?php

namespace App\Http\Requests\Kanban;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreKanbanBoardRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user() === null) {
            return false;
        }

        if ($this->route('board') !== null) {
            $this->user()->ownedKanbanBoards()->findOrFail($this->route('board'));
        }

        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('title'))) {
            $this->merge(['title' => Str::trim($this->input('title'))]);
        }
    }

    public function rules(): array
    {
        $title = ['title' => ['required', 'string', 'min:1', 'max:30']];
        $revision = ['revision' => ['required', 'integer', 'min:0']];

        return match ($this->route()->getActionMethod()) {
            'update' => $title + $revision,
            'destroy' => $revision,
            default => $title,
        };
    }
}
