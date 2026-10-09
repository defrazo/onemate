import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../model';

type TaskSummary = {
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
	completed: boolean;
};

export const formatTaskSummary = (task: TaskSummary): string => {
	const formatDate = (value: string): string => {
		const [year, month, day] = value.split('-');
		return `${day}.${month}.${year}`;
	};

	const lines = [
		task.title,
		...(task.description ? ['', task.description] : []),
		'',
		`Статус: ${TASK_STATUS[task.status].label}`,
		`Приоритет: ${TASK_PRIORITY[task.priority].label}`,
		`Период: ${formatDate(task.startDate)} – ${task.endDate ? formatDate(task.endDate) : 'Без срока'}`,
		`Завершено: ${task.completed ? 'Да' : 'Нет'}`,
	];

	return lines.join('\n');
};
