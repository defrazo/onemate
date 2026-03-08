import editIcon from '@/shared/assets/icons/actions/edit.svg?raw';
import optionsIcon from '@/shared/assets/icons/actions/options.svg?raw';
import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg, TASK_PRIORITY, TASK_STATUS, TaskPriority, TaskStatus } from '../lib';
import { createState, type Task } from '../model';
import { controls, deleteDialog, editTaskDialog, layout } from '.';
import { viewTaskDialog } from './dialogs';

export const createTaskCard = (task: Task, state: ReturnType<typeof createState>): HTMLElement => {
	// === TASK CARD ===
	const taskCard = document.createElement('div');
	taskCard.className = cn(
		layout.col,
		'bg-(--bg-secondary) min-h-[200px] border-(--border-color) gap-1 hover:border-(--accent-hover)'
	);
	taskCard.dataset.taskId = task.id;

	// === TASK HEADER ===
	const taskHeader = document.createElement('div');
	taskHeader.className = cn('border-b border-(--border-color) flex justify-between p-2 hover:cursor-grab relative');

	const taskTitle = document.createElement('h2');
	taskTitle.textContent = task.title;
	taskTitle.dataset.taskDragHandle = '';
	taskTitle.draggable = true;
	taskTitle.className = 'font-bold w-full text-left';

	const optionsButton = document.createElement('button');
	optionsButton.type = 'button';
	optionsButton.className = cn(controls.iconButton, 'pl-2');
	insertSvg(optionsButton, optionsIcon, 'size-3');
	optionsButton.addEventListener('click', (event) => {
		event.stopPropagation();
		optionsMenu.classList.toggle('hidden');
	});

	document.addEventListener('click', () => optionsMenu.classList.add('hidden'));

	const optionsMenu = document.createElement('div');
	optionsMenu.className = cn(
		layout.col,
		'absolute w-36 flex right-0 top-8 bg-(--bg-tertiary) border border-(--border-color) rounded-md shadow-md hidden'
	);

	const editOption = document.createElement('button');
	editOption.className = cn('px-3 py-1 cursor-pointer text-left rounded-md w-full hover:bg-(--accent-hover)');
	editOption.textContent = 'Редактировать';
	editOption.addEventListener('click', () => onEdit());
	insertSvg(editOption, editIcon, 'size-5');

	const deleteOption = document.createElement('button');
	deleteOption.className = cn('px-3 py-1 cursor-pointer text-left rounded-md w-full hover:bg-(--accent-hover)');
	deleteOption.textContent = 'Удалить';
	deleteOption.addEventListener('click', () => onDelete());
	insertSvg(deleteOption, deleteIcon, 'size-5');

	optionsMenu.append(editOption, deleteOption);

	taskHeader.append(taskTitle, optionsButton, optionsMenu);

	// === STATUS BAR ===
	const attributes = document.createElement('div');
	attributes.className = cn(layout.row, layout.between, '');

	const status = document.createElement('div');
	status.className = cn(layout.row, 'gap-2 text-sm items-center');

	let statusConfig = TASK_STATUS[task.status as TaskStatus];
	if (!statusConfig) {
		console.warn('Unknown task status:', task.status);
		statusConfig = TASK_STATUS.active;
	}

	let priorityConfig = TASK_PRIORITY[task.priority as TaskPriority];
	if (!priorityConfig) {
		console.warn('Unknown task priority:', task.priority);
		priorityConfig = TASK_PRIORITY.medium;
	}

	const statusDot = document.createElement('span');
	statusDot.className = 'relative flex size-1.5 mb-0.5';

	const innerDot = document.createElement('span');
	innerDot.style.backgroundColor = `var(${statusConfig.color})`;
	innerDot.className = 'relative size-1.5 rounded-full';

	statusDot.append(innerDot);

	if ('halo' in statusConfig && statusConfig.halo) {
		const halo = document.createElement('span');
		halo.className = cn('absolute inset-0 rounded-full animate-ping', `bg-(${statusConfig.color}) opacity-40`);

		statusDot.append(halo);
	}

	const statusText = document.createElement('span');
	statusText.textContent = statusConfig.label;

	status.append(statusDot, statusText);

	const priority = document.createElement('div');
	priority.textContent = priorityConfig.label;
	priority.className = 'text-xs rounded-full px-2 py-0.5';
	priority.style.color = `var(${priorityConfig.color})`;
	priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 30%, transparent)`;

	attributes.append(status, priority);

	// === TASK CONTENT ===
	const taskContent = document.createElement('div');
	taskContent.className = cn(layout.col, 'flex-1 gap-2 p-2 cursor-zoom-in');

	const taskDescription = document.createElement('p');
	taskDescription.textContent = task.description;
	taskDescription.className = 'text-sm flex-1 p-2 text-(--color-secondary)';

	const timestamp = document.createElement('div');
	timestamp.textContent = task.date;
	timestamp.className = 'select-none p-2 border-t border-(--border-color) text-xs text-(--color-disabled)';

	taskContent.addEventListener('click', () => onView());

	taskContent.append(attributes, taskDescription);

	const onView = () => {
		const modal = viewTaskDialog({
			initialData: {
				title: task.title,
				description: task.description,
				startDate: task.startDate,
				endDate: task.endDate,
			},
		});

		document.body.append(modal);
	};

	const onEdit = () => {
		const modal = editTaskDialog({
			mode: 'edit',
			initialData: {
				title: task.title,
				description: task.description,
				status: task.status,
				priority: task.priority,
				startDate: task.startDate,
				endDate: task.endDate,
			},
			onSubmit: (title, description, status, priority, startDate, endDate) => {
				state.editTask(task.id, title, description, status, priority, task.date, startDate, endDate);
			},
		});

		document.body.append(modal);
	};

	const onDelete = () => {
		const modal = deleteDialog('Удаление задачи', 'Вы уверены, что хотите удалить задачу?', () =>
			state.deleteTask(task.id)
		);

		document.body.append(modal);
	};

	// === ASSEMBLY ===
	taskCard.append(taskHeader, taskContent, timestamp);

	return taskCard;
};
