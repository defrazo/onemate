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
            [0, 'Спланировать неделю', 'Выбрать три главные цели и распределить задачи по дням.', 'waiting', 'high', 0, 3, false, 1000],
            [0, 'Обновить рабочее место', '', null, 'low', null, null, false, 2000],
            [0, 'Придумать идею для мини-проекта', 'Найти интересную задачу, которую реально реализовать за выходные.', 'waiting', null, 2, null, false, 3000],
            [0, 'Разобрать цифровой архив', '', null, null, null, 14, false, 4000],

            [1, 'Подготовить структуру проекта', 'Определить основные разделы и последовательность разработки.', 'waiting', 'high', 0, null, false, 1000],
            [1, 'Сравнить полезные инструменты', '', null, 'low', -5, -1, true, 2000],

            [2, 'Разработать новый интерфейс', 'Собрать адаптивный макет, настроить состояния элементов и анимации.', 'active', 'high', -4, 6, false, 1000],
            [2, 'Исправить найденные ошибки', 'Проверить проблемные сценарии и устранить причины сбоев.', 'active', 'high', -6, -2, false, 2000],
            [2, 'Проверить мобильную версию', '', null, 'medium', null, 5, false, 3000],

            [3, 'Собрать референсы для дизайна', 'Подобрать цветовые сочетания, типографику и примеры композиций.', 'active', 'medium', -2, 4, false, 1000],
            [3, 'Создать дизайн-систему', 'Собрать базовые цвета, типографику, кнопки и поля ввода.', null, 'medium', -10, -3, true, 2000],
        ];

        return array_map(function ($task) use ($columnIds, $day) {
            [$column, $title, $description, $status, $priority, $start, $end, $completed, $position] = $task;

            return [
                'column_id' => $columnIds[$column],
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'start_date' => $start !== null ? $day->addDays($start)->toDateString() : null,
                'end_date' => $end !== null ? $day->addDays($end)->toDateString() : null,
                'completed' => $completed,
                'position' => $position,
            ];
        }, $definitions);
    }
}
