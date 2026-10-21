import { dateOffset } from '@/shared/lib/utils';

import type { AppNotification } from '../model';

export const demoNotifications: AppNotification[] = [
	{
		id: 'demo-kanban-1',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Обновить главную страницу',
		readAt: null,
		createdAt: dateOffset({ days: -3, hours: -2, minutes: -15, withTime: true }),
	},
	{
		id: 'demo-kanban-2',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Подготовить документацию API',
		readAt: null,
		createdAt: dateOffset({ days: -4, hours: -5, minutes: -18, withTime: true }),
	},
	{
		id: 'demo-kanban-3',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Обновить план на месяц',
		readAt: null,
		createdAt: dateOffset({ days: -5, hours: -6, minutes: -21, withTime: true }),
	},
	{
		id: 'demo-kanban-4',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Уточнить детали заказа',
		readAt: dateOffset({ days: -5, hours: -6, minutes: -21, withTime: true }),
		createdAt: dateOffset({ days: -5, hours: -8, minutes: -25, withTime: true }),
	},
	{
		id: 'demo-kanban-5',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Уточнить детали заказа',
		readAt: null,
		createdAt: dateOffset({ days: -6, hours: -9, minutes: -32, withTime: true }),
	},
];
