import { cn } from '@/shared/lib/utils';

import { type Task, TASK_PRIORITY, TASK_STATUS } from '../../model';

export const createTaskMeta = (task: Task) => {
	const element = document.createElement('div');
	element.className = cn('flex min-h-7 items-center justify-between', task.completed && 'opacity-30');

	// === STATUS ===
	if (task.status !== null) {
		const statusConfig = TASK_STATUS[task.status];

		const status = document.createElement('span');
		status.textContent = statusConfig.label;
		status.className = 'trim text-xs text-(--text-secondary)';

		element.append(status);
	}

	// === PRIORITY ===
	if (task.priority !== null) {
		const priorityConfig = TASK_PRIORITY[task.priority];

		const priority = document.createElement('span');
		priority.textContent = priorityConfig.label;
		priority.className = 'trim ml-auto rounded-md px-2 py-1.5 text-xs';
		priority.style.color = `var(${priorityConfig.color})`;
		priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 10%, transparent)`;

		element.append(priority);
	}

	return { element };
};
