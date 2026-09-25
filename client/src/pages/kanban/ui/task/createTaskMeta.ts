import { cn } from '@/shared/lib/utils';

import { type Task, TASK_PRIORITY, TASK_STATUS } from '../../model';

export const createTaskMeta = (task: Task) => {
	const element = document.createElement('div');
	element.className = cn('flex items-center justify-between', task.completed && 'opacity-30');

	const status = document.createElement('div');
	status.className = 'flex items-center gap-2';

	const statusConfig = TASK_STATUS[task.status] ?? TASK_STATUS.active;

	const statusDot = document.createElement('span');
	statusDot.className = 'relative flex size-1.5';

	const innerDot = document.createElement('span');
	innerDot.className = 'relative size-1.5 rounded-full';
	innerDot.style.backgroundColor = `var(${statusConfig.color})`;

	statusDot.append(innerDot);

	if ('halo' in statusConfig && statusConfig.halo) {
		const halo = document.createElement('span');
		halo.className = 'absolute inset-0 animate-ping rounded-full';
		halo.style.backgroundColor = `color-mix(in srgb, var(${statusConfig.color}) 50%, transparent)`;

		statusDot.append(halo);
	}

	const statusText = document.createElement('span');
	statusText.textContent = statusConfig.label;
	statusText.className = 'trim text-xs opacity-90';

	status.append(statusDot, statusText);

	const priorityConfig = TASK_PRIORITY[task.priority] ?? TASK_PRIORITY.medium;

	const priority = document.createElement('span');
	priority.textContent = priorityConfig.label;
	priority.className = 'trim rounded-md px-2 py-1.5 text-xs';
	priority.style.color = `var(${priorityConfig.color})`;
	priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 7%, transparent)`;

	element.append(status, priority);

	return { element };
};
