<?php

namespace App\Services\Kanban;

use Carbon\CarbonImmutable;

class KanbanDefaults
{
    public static function columns(): array
    {
        return [
            ['title' => 'Запланировано', 'color' => 'slate', 'task_limit' => 10, 'position' => 1000],
            ['title' => 'Подготовка', 'color' => 'amber', 'task_limit' => 10, 'position' => 2000],
            ['title' => 'В работе', 'color' => 'rose', 'task_limit' => 10, 'position' => 3000],
            ['title' => 'Завершено', 'color' => 'lime', 'task_limit' => 10, 'position' => 4000],
        ];
    }

    public static function tasks(array $columnIds, CarbonImmutable $day): array
    {
        $definitions = [
            [0, 'Составить план на неделю', 'Определи основные задачи на ближайшие дни, чтобы понимать объём работы.', 'high', 0, 2, 1000],
            [1, 'Подготовить материалы к совещанию', 'Собери документы, заметки и данные, которые понадобятся на встрече.', 'medium', 0, 4, 1000],
            [0, 'Уточнить информацию у коллег', 'Свяжись с ответственными сотрудниками и уточни недостающие детали по проекту.', 'low', 1, 3, 2000],
            [2, 'Подготовить шаблон документа', 'Сделай простой шаблон, которым смогут пользоваться коллеги.', 'high', -2, 7, 1000],
            [3, 'Проверить выполненные задачи', 'Убедись, что завершённые задачи действительно закрыты и всё оформлено корректно.', 'low', -3, -1, 1000],
            [3, 'Отправить отчёт руководителю', 'Собери краткое резюме по текущему прогрессу и отправь на почту.', 'medium', -2, -1, 2000],
        ];

        return array_map(function ($task) use ($columnIds, $day) {
            [$column, $title, $description, $priority, $start, $end, $position] = $task;

            return [
                'column_id' => $columnIds[$column],
                'title' => $title,
                'description' => $description,
                'status' => 'waiting',
                'priority' => $priority,
                'start_date' => $day->addDays($start)->toDateString(),
                'end_date' => $day->addDays($end)->toDateString(),
                'completed' => false,
                'position' => $position,
            ];
        }, $definitions);
    }
}
