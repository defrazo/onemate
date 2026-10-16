import type { AppNotification } from '../model';

export const demoNotifications: AppNotification[] = [
	{
		id: 'demo-kanban-1',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Обновить главную страницу',
		readAt: null,
		createdAt: '2026-10-15T10:30:00.000Z',
	},
	{
		id: 'demo-kanban-2',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Подготовить документацию API',
		readAt: null,
		createdAt: '2026-10-14T14:15:00.000Z',
	},
	{
		id: 'demo-kanban-3',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Обновить план на месяц',
		readAt: null,
		createdAt: '2026-10-14T13:00:00.000Z',
	},
	{
		id: 'demo-kanban-4',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Уточнить детали заказа',
		readAt: '2026-10-14T12:00:00.000Z',
		createdAt: '2026-10-14T11:00:00.000Z',
	},
	{
		id: 'demo-kanban-5',
		type: 'kanban.task_overdue',
		title: 'Задача просрочена',
		message: 'Уточнить детали заказа',
		readAt: null,
		createdAt: '2026-10-14T11:00:00.000Z',
	},
];
