import { TASK_PRIORITY, TASK_STATUS } from '../model/constants';
import type { TaskPriority, TaskStatus } from '../model/types';

type TaskSummary = {
	title: string;
	description?: string;
	status: TaskStatus | null;
	priority: TaskPriority | null;
	startDate: string | null;
	endDate: string | null;
	remindBeforeDays: number | null;
	completed: boolean;
};

export const formatTaskSummary = (task: TaskSummary): string => {
	const formatDate = (value: string): string => {
		const [year, month, day] = value.slice(0, 10).split('-');
		return `${day}.${month}.${year}`;
	};

	const period =
		task.startDate && task.endDate
			? `${formatDate(task.startDate)} – ${formatDate(task.endDate)}`
			: task.startDate
				? `С ${formatDate(task.startDate)}`
				: task.endDate
					? `До ${formatDate(task.endDate)}`
					: 'Не задан';

	const reminder =
		task.remindBeforeDays === null
			? 'Нет'
			: task.remindBeforeDays === 0
				? 'В день срока'
				: task.remindBeforeDays === 1
					? 'За 1 день'
					: task.remindBeforeDays === 7
						? 'За неделю'
						: `За ${task.remindBeforeDays} дн.`;

	const lines = [
		task.title,
		...(task.description ? ['', task.description] : []),
		'',
		`Статус: ${task.status !== null ? TASK_STATUS[task.status].label : 'Не задан'}`,
		`Приоритет: ${task.priority !== null ? TASK_PRIORITY[task.priority].label : 'Не задан'}`,
		`Период: ${period}`,
		`Напомнить: ${reminder}`,
		`Завершено: ${task.completed ? 'Да' : 'Нет'}`,
	];

	return lines.join('\n');
};
