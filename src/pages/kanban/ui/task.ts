import editIcon from '@/shared/assets/icons/actions/edit.svg?raw';
import optionsIcon from '@/shared/assets/icons/actions/options.svg?raw';
import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import viewIcon from '@/shared/assets/icons/system/indicators/eye.svg?raw';
import { cn, fullDate } from '@/shared/lib/utils';

import { deviceUtils, insertSvg, TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../lib';
import { createState, type Task } from '../model';
import { border, button, deleteDialog, editTaskDialog, layout, primitives, viewTaskDialog } from '.';

const getOption = (index: number, icon: string, title: string, callback: () => void): HTMLElement => {
	const option = document.createElement('button');
	const roundedVariants = ['hover:rounded-t-xl', 'hover:rounded-none', 'hover:rounded-b-xl'] as const;

	option.className = cn(
		layout.row,
		'xl:gap-2 gap-3 px-5 xl:px-3 xl:py-2 py-3 cursor-pointer text-left w-full hover:bg-(--accent-hover)',
		roundedVariants[index]
	);
	insertSvg(option, icon, 'size-4');
	option.append(title);
	option.addEventListener('click', callback);

	return option;
};

export const createTaskCard = (task: Task, state: ReturnType<typeof createState>): HTMLElement => {
	const device = deviceUtils.getDevice();

	// === TASK CARD ===
	const taskCard = document.createElement('div');
	taskCard.className = cn(layout.col, 'bg-(--bg-secondary) min-w-0 min-h-[180px]');
	taskCard.dataset.taskId = task.id;

	// === TASK HEADER ===
	const taskHeader = document.createElement('div');
	taskHeader.className = cn(
		layout.row,
		'border-b border-(--border-color) min-w-0  justify-between hover:cursor-grab relative'
	);

	const taskTitle = document.createElement('h2');
	taskTitle.textContent = task.title;
	taskTitle.dataset.taskDragHandle = '';
	taskTitle.className = cn(
		primitives.title,
		'min-w-0 py-3 pl-3 truncate cursor-grab',
		task.completed && 'line-through opacity-30'
	);

	// Task Options
	const optionsButton = document.createElement('button');
	optionsButton.type = 'button';
	optionsButton.title = 'Действия с задачей';
	optionsButton.className = cn(
		button.icon,
		'p-3 border-l border-transparent hover:border-(--border-color-op) rounded-none',
		task.completed && 'opacity-30 hover:opacity-100'
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
		'absolute w-fit z-10 divide-y divide-(--border-color) right-0 top-8 hidden'
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
	attributes.className = cn(layout.row, 'select-none cursor-default justify-between', task.completed && 'opacity-30');

	// Task Status
	const status = document.createElement('div');
	status.className = cn(layout.row, 'gap-2');

	let statusConfig = TASK_STATUS[task.status as TaskStatus];
	if (!statusConfig) statusConfig = TASK_STATUS.active;

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
	statusText.className = 'text-sm';

	status.append(statusDot, statusText);

	// Task Priority
	let priorityConfig = TASK_PRIORITY[task.priority as TaskPriority];
	if (!priorityConfig) priorityConfig = TASK_PRIORITY.medium;

	const priority = document.createElement('div');
	priority.textContent = priorityConfig.label;
	priority.className = 'text-xs rounded-full px-2 py-0.5';
	priority.style.color = `var(${priorityConfig.color})`;
	priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 10%, transparent)`;

	attributes.append(status, priority);

	// === TASK CONTENT ===
	const taskContent = document.createElement('div');
	taskContent.className = cn(layout.col, 'flex-1 gap-2 p-3', task.completed && 'opacity-30');

	const taskDescription = document.createElement('p');
	taskDescription.textContent = task.description;
	taskDescription.className = cn(
		'text-sm text-justify text-(--color-secondary) select-none leading-[18px] cursor-default wrap overflow-hidden text-ellipsis line-clamp-3'
	);

	const timestamp = document.createElement('div');
	timestamp.textContent = fullDate(task.createdAt);
	timestamp.className = cn(
		primitives.hint,
		'text-xs xl:text-xs px-3 pb-3 leading-4 border-(--border-color)',
		task.completed && 'opacity-30'
	);

	taskContent.append(attributes, taskDescription);

	// === ACTION FUNCTIONS ===
	const onView = () => {
		const modal = viewTaskDialog({
			initial: {
				title: task.title,
				description: task.description,
				startDate: task.startDate,
				endDate: task.endDate,
				completed: task.completed,
			},
			onSubmit: (completed) => {
				state.editTask(
					task.id,
					task.title,
					task.description,
					task.status,
					task.priority,
					task.startDate,
					task.endDate,
					completed,
					task.createdAt
				);
			},
		});

		document.body.append(modal);
	};

	const onEdit = () => {
		const modal = editTaskDialog({
			mode: 'edit',
			initial: {
				title: task.title,
				description: task.description,
				status: task.status,
				priority: task.priority,
				startDate: task.startDate,
				endDate: task.endDate,
				completed: task.completed,
			},
			onSubmit: (title, description, status, priority, startDate, endDate, completed) => {
				state.editTask(
					task.id,
					title,
					description,
					status,
					priority,
					startDate,
					endDate,
					completed,
					task.createdAt
				);
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
