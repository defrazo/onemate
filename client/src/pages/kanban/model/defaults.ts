import { dateOffset } from '@/shared/lib/utils';

import type { CreateColumnInput, CreateTaskInput } from '.';

export const getDefaultColumns = (): CreateColumnInput[] => [
	{ title: 'Запланировано', color: 'slate', taskLimit: 10, position: 1000 },
	{ title: 'Подготовка', color: 'amber', taskLimit: 10, position: 2000 },
	{ title: 'В работе', color: 'rose', taskLimit: 10, position: 3000 },
	{ title: 'Завершено', color: 'lime', taskLimit: 10, position: 4000 },
];

export const getDefaultTasks = (columnIds: string[]): CreateTaskInput[] => [
	{
		columnId: columnIds[0] ?? '',
		title: 'Составить план на неделю',
		description: 'Определи основные задачи на ближайшие дни, чтобы понимать объём работы.',
		status: 'waiting',
		priority: 'high',
		startDate: dateOffset({ days: 0 }),
		endDate: dateOffset({ days: 2 }),
		completed: false,
		position: 1000,
	},
	{
		columnId: columnIds[1] ?? '',
		title: 'Подготовить материалы к совещанию',
		description: 'Собери документы, заметки и данные, которые понадобятся на встрече.',
		status: 'waiting',
		priority: 'medium',
		startDate: dateOffset({ days: 0 }),
		endDate: dateOffset({ days: 4 }),
		completed: false,
		position: 1000,
	},
	{
		columnId: columnIds[0] ?? '',
		title: 'Уточнить информацию у коллег',
		description: 'Свяжись с ответственными сотрудниками и уточни недостающие детали по проекту.',
		status: 'waiting',
		priority: 'low',
		startDate: dateOffset({ days: 1 }),
		endDate: dateOffset({ days: 3 }),
		completed: false,
		position: 2000,
	},
	{
		columnId: columnIds[2] ?? '',
		title: 'Подготовить шаблон документа',
		description: 'Сделай простой шаблон, которым смогут пользоваться коллеги.',
		status: 'waiting',
		priority: 'high',
		startDate: dateOffset({ days: -2 }),
		endDate: dateOffset({ days: 7 }),
		completed: false,
		position: 1000,
	},
	{
		columnId: columnIds[3] ?? '',
		title: 'Проверить выполненные задачи',
		description: 'Убедись, что завершённые задачи действительно закрыты и всё оформлено корректно.',
		status: 'waiting',
		priority: 'low',
		startDate: dateOffset({ days: -3 }),
		endDate: dateOffset({ days: -1 }),
		completed: false,
		position: 1000,
	},
	{
		columnId: columnIds[3] ?? '',
		title: 'Отправить отчёт руководителю',
		description: 'Собери краткое резюме по текущему прогрессу и отправь на почту.',
		status: 'waiting',
		priority: 'medium',
		startDate: dateOffset({ days: -2 }),
		endDate: dateOffset({ days: -1 }),
		completed: false,
		position: 2000,
	},
];
