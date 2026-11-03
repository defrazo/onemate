import { type Task, TASK_PRIORITY, TASK_STATUS } from '../../model';

export const createTaskMeta = (task: Task) => {
	const element = document.createElement('div');
	element.className = 'flex min-h-5.5 items-center justify-between';

	// === STATUS ===
	if (task.status !== null) {
		const statusConfig = TASK_STATUS[task.status];

		const status = document.createElement('span');
		status.textContent = statusConfig.label;
		status.className = 'trim text-xs text-(--text-secondary)';

		element.append(status);
	} else {
		const placeholder = document.createElement('span');
		placeholder.textContent = '—';
		placeholder.className = 'px-2 py-1.5 text-xs text-(--text-tertiary)/60';

		element.append(placeholder);
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
	} else {
		const placeholder = document.createElement('span');
		placeholder.textContent = '—';
		placeholder.className = 'px-2 py-1.5 text-xs text-(--text-tertiary)/60';

		element.append(placeholder);
	}

	return { element };
};
