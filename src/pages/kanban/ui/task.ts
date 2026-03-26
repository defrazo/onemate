import editIcon from '@/shared/assets/icons/actions/edit.svg?raw';
import optionsIcon from '@/shared/assets/icons/actions/options.svg?raw';
import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import viewIcon from '@/shared/assets/icons/system/indicators/eye.svg?raw';
import { cn } from '@/shared/lib/utils';

import { deviceUtils, insertSvg, TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../lib';
import { createState, type Task } from '../model';
import { border, button, deleteDialog, editTaskDialog, layout, primitives, viewTaskDialog } from '.';

const getOption = (index: number, icon: string, title: string, cb: () => void): HTMLElement => {
	const option = document.createElement('button');
	const roundedVariants = ['hover:rounded-t-xl', 'hover:rounded-none', 'hover:rounded-b-xl'] as const;

	option.className = cn(
		layout.row,
		'gap-2 px-3 py-2 cursor-pointer text-left w-full hover:bg-(--accent-hover)',
		roundedVariants[index]
	);
	insertSvg(option, icon, 'size-4');
	option.append(title);
	option.addEventListener('click', () => cb());

	return option;
};

export const createTaskCard = (task: Task, state: ReturnType<typeof createState>): HTMLElement => {
	const device = deviceUtils.getDevice();

	// === TASK CARD ===
	const taskCard = document.createElement('div');
	taskCard.className = cn(layout.col, 'bg-(--bg-secondary) rounded-md min-h-[180px]');
	taskCard.dataset.taskId = task.id;

	// === TASK HEADER ===
	const taskHeader = document.createElement('div');
	taskHeader.className = cn(
		layout.row,
		'border-b border-(--border-color) justify-between  hover:cursor-grab relative'
	);

	const taskTitle = document.createElement('h2');
	taskTitle.textContent = task.title;
	taskTitle.dataset.taskDragHandle = '';
	taskTitle.className = cn(
		primitives.title,
		'w-full cursor-grab py-2 pl-2 overflow-hidden text-ellipsis line-clamp-1 display-box webkit-box-orient-vertical leading-4'
	);

	const optionsButton = document.createElement('button');
	optionsButton.type = 'button';
	optionsButton.title = 'Действия с задачей';
	optionsButton.className = cn(
		button.icon,
		'p-3 border-l border-transparent hover:border-(--border-color-op) rounded-none'
	);
	insertSvg(optionsButton, optionsIcon, 'size-3');
	optionsButton.addEventListener('click', (event) => {
		event.stopPropagation();
		document.querySelectorAll('[data-options-menu]').forEach((menu) => {
			if (menu !== optionsMenu) menu.classList.add('hidden');
		});
		optionsMenu.classList.toggle('hidden');
	});

	document.addEventListener('click', () => optionsMenu.classList.add('hidden'));

	const optionsMenu = document.createElement('div');
	optionsMenu.dataset.optionsMenu = '';
	optionsMenu.className = cn(
		layout.blur,
		layout.col,
		border.default,
		'absolute w-fit z-10 divide-y divide-(--border-color) right-0 text-sm top-8 hidden'
	);

	const options = [
		{ index: 0, icon: viewIcon, title: 'Просмотреть', action: () => onView() },
		{ index: 1, icon: editIcon, title: 'Редактировать', action: () => onEdit() },
		{ index: 2, icon: deleteIcon, title: 'Удалить', action: () => onDelete() },
	];
	options.forEach((option) => optionsMenu.append(getOption(option.index, option.icon, option.title, option.action)));

	taskHeader.append(taskTitle, optionsButton, optionsMenu);

	// === ATTRIBUTES BAR ===
	const attributes = document.createElement('div');
	attributes.className = cn(layout.row, 'select-none cursor-default justify-between');

	const status = document.createElement('div');
	status.className = cn(layout.row, 'gap-2 text-sm');

	let statusConfig = TASK_STATUS[task.status as TaskStatus];
	if (!statusConfig) statusConfig = TASK_STATUS.active;

	let priorityConfig = TASK_PRIORITY[task.priority as TaskPriority];
	if (!priorityConfig) priorityConfig = TASK_PRIORITY.medium;

	const statusDot = document.createElement('span');
	statusDot.className = 'relative flex size-1.5 mb-0.5';

	const innerDot = document.createElement('span');
	innerDot.style.backgroundColor = `var(${statusConfig.color})`;
	innerDot.className = 'relative size-1.5 rounded-full';

	statusDot.append(innerDot);

	if ('halo' in statusConfig && statusConfig.halo) {
		const halo = document.createElement('span');
		halo.className = cn('absolute inset-0 rounded-full animate-ping');
		halo.style.backgroundColor = `color-mix(in srgb, var(${statusConfig.color}) 50%, transparent)`;

		statusDot.append(halo);
	}

	const statusText = document.createElement('span');
	statusText.textContent = statusConfig.label;
	statusText.className = 'text-xs';

	status.append(statusDot, statusText);

	const priority = document.createElement('div');
	priority.textContent = priorityConfig.label;
	priority.className = 'text-xs rounded-full px-2 py-0.5';
	priority.style.color = `var(${priorityConfig.color})`;
	priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 10%, transparent)`;

	attributes.append(status, priority);

	// === TASK CONTENT ===
	const taskContent = document.createElement('div');
	taskContent.className = cn(layout.col, 'flex-1 gap-2 p-2');

	const taskDescription = document.createElement('p');
	taskDescription.textContent = task.description;
	taskDescription.className = cn(
		'text-sm text-justify text-(--color-secondary) select-none cursor-default overflow-hidden text-ellipsis line-clamp-3'
	);

	const timestamp = document.createElement('div');
	timestamp.textContent = task.date;
	timestamp.className = cn(primitives.hint, 'text-xs border-t p-2 border-(--border-color)');

	taskContent.append(attributes, taskDescription);

	// === ACTION FUNCTIONS ===
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

	device === 'mobile' ? (taskCard.draggable = true) : (taskTitle.draggable = true);

	// === ASSEMBLY ===
	taskCard.append(taskHeader, taskContent, timestamp);

	return taskCard;
};
