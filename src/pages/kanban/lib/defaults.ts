import type { Column, Task } from '../model';

export const getDefaultColumns = (): Omit<Column, 'id'>[] => [
	{ title: 'Запланировано', position: 0, taskLimit: 10, color: 'slate' },
	{ title: 'Подготовка', position: 1, taskLimit: 10, color: 'amber' },
	{ title: 'В работе', position: 2, taskLimit: 10, color: 'rose' },
	{ title: 'Завершено', position: 3, taskLimit: 10, color: 'lime' },
];

export const getDefaultTasks = (columnIds: string[]): Omit<Task, 'id'>[] => [
	{
		title: 'Составить план на неделю',
		description: 'Определи приоритеты и задачи на эту неделю.',
		columnId: columnIds[0] ?? '',
		status: 'waiting',
		priority: 'high',
		position: 0,
		date: '18.03.2026, 10:00',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
	},
	{
		title: 'Собрать материалы для проекта',
		description: 'Найди все необходимые документы и данные для нового проекта.',
		columnId: columnIds[1] ?? '',
		status: 'waiting',
		priority: 'medium',
		position: 0,
		date: '18.03.2026, 11:00',
		startDate: '2026-03-18',
		endDate: '2026-03-22',
	},
	{
		title: 'Разработать компонент UI',
		description: 'Создай базовый компонент для интерфейса с учетом FSD структуры.',
		columnId: columnIds[2] ?? '',
		status: 'waiting',
		priority: 'high',
		position: 0,
		date: '18.03.2026, 12:00',
		startDate: '2026-03-18',
		endDate: '2026-03-25',
	},
	{
		title: 'Проверить завершенные задачи',
		description: 'Убедись, что все выполненные задачи корректно закрыты и результаты сохранены.',
		columnId: columnIds[3] ?? '',
		status: 'waiting',
		priority: 'low',
		position: 0,
		date: '18.03.2026, 13:00',
		startDate: '2026-03-18',
		endDate: '2026-03-18',
	},
];
