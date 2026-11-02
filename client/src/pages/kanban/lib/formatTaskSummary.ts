import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../model';

type TaskSummary = {
	title: string;
	description?: string;
	status: TaskStatus | null;
	priority: TaskPriority | null;
	startDate: string | null;
	endDate: string | null;
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
					: null;

	const lines = [
		task.title,
		...(task.description ? ['', task.description] : []),
		'',
		...(task.status !== null ? [`Статус: ${TASK_STATUS[task.status].label}`] : []),
		...(task.priority !== null ? [`Приоритет: ${TASK_PRIORITY[task.priority].label}`] : []),
		...(period ? [`Период: ${period}`] : []),
		`Завершено: ${task.completed ? 'Да' : 'Нет'}`,
	];

	return lines.join('\n');
};
