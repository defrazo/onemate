import editIcon from '@/shared/assets/icons/actions/edit.svg?raw';
import optionsIcon from '@/shared/assets/icons/actions/options.svg?raw';
import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import viewIcon from '@/shared/assets/icons/system/indicators/eye.svg?raw';
import { cn, fullDate } from '@/shared/lib/utils';

import { deviceUtils, insertSvg, TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../lib';
import { createState, type Task } from '../model';
import { border, button, deleteDialog, editTask, layout, primitives, viewTask } from '.';

type CreateTaskCardInstance = { element: HTMLElement; destroy: () => void };

export const createTaskCard = (task: Task, state: ReturnType<typeof createState>): CreateTaskCardInstance => {
	let isDestroyed = false;

	let viewTaskModal: ReturnType<typeof viewTask> | null = null;
	let editTaskModal: ReturnType<typeof editTask> | null = null;
	let deleteTaskModal: ReturnType<typeof deleteDialog> | null = null;

	// === TASK CARD ===
	const taskCard = document.createElement('div');
	taskCard.className = cn(layout.col, 'min-h-[180px] min-w-0 bg-(--bg-secondary)');
	taskCard.dataset.taskId = task.id;

	// === TASK HEADER ===
	const taskHeader = document.createElement('div');
	taskHeader.className = cn(
		layout.row,
		'relative min-w-0 justify-between border-b border-(--border-color) hover:cursor-grab'
	);

	const taskTitle = document.createElement('h2');
	taskTitle.textContent = task.title;
	taskTitle.dataset.taskDragHandle = '';
	taskTitle.className = cn(
		primitives.title,
		'w-full min-w-0 cursor-grab truncate py-3 pl-3',
		task.completed && 'line-through opacity-30'
	);

	// Task Options
	const optionsButton = document.createElement('button');
	optionsButton.type = 'button';
	optionsButton.title = 'Действия с задачей';
	optionsButton.className = cn(
		button.icon,
		'rounded-none border-l border-transparent p-3 hover:border-(--border-color-op)',
		task.completed && 'opacity-30 hover:opacity-100'
	);
	insertSvg(optionsButton, optionsIcon, 'size-3');

	const optionsMenu = document.createElement('div');
	optionsMenu.dataset.taskOptions = '';
	optionsMenu.className = cn(
		layout.blur,
		layout.col,
		border.default,
		'absolute top-8 right-0 z-10 hidden w-fit divide-y divide-(--border-color)'
	);

	const onOptionsButtonClick = (event: MouseEvent) => {
		event.stopPropagation();

		document.querySelectorAll('[data-task-options]').forEach((menu) => {
			if (menu !== optionsMenu) menu.classList.add('hidden');
		});

		optionsMenu.classList.toggle('hidden');
	};

	const onDocumentClick = (event: MouseEvent) => {
		const target = event.target as Node | null;
		if (!target) return;

		if (!taskCard.contains(target)) optionsMenu.classList.add('hidden');
	};

	optionsButton.addEventListener('click', onOptionsButtonClick);
	document.addEventListener('click', onDocumentClick);

	const optionDefs = [
		{ index: 0, icon: viewIcon, title: 'Просмотреть', action: onViewTask },
		{ index: 1, icon: editIcon, title: 'Редактировать', action: onEditTask },
		{ index: 2, icon: deleteIcon, title: 'Удалить', action: onDeleteTask },
	];

	const optionInstances = optionDefs.map((item) => createOption(item.index, item.icon, item.title, item.action));
	optionInstances.forEach(({ option }) => optionsMenu.append(option));

	taskHeader.append(taskTitle, optionsButton, optionsMenu);

	// === ATTRIBUTES BAR ===
	const attributes = document.createElement('div');
	attributes.className = cn(layout.row, 'cursor-default justify-between select-none', task.completed && 'opacity-30');

	// Task Status
	const status = document.createElement('div');
	status.className = cn(layout.row, 'gap-2');

	let statusConfig = TASK_STATUS[task.status as TaskStatus];
	if (!statusConfig) statusConfig = TASK_STATUS.active;

	const statusDot = document.createElement('span');
	statusDot.className = 'relative mb-0.5 flex size-1.5';

	const innerDot = document.createElement('span');
	innerDot.style.backgroundColor = `var(${statusConfig.color})`;
	innerDot.className = 'relative size-1.5 rounded-full';

	statusDot.append(innerDot);

	if ('halo' in statusConfig && statusConfig.halo) {
		const halo = document.createElement('span');
		halo.className = 'absolute inset-0 animate-ping rounded-full';
		halo.style.backgroundColor = `color-mix(in srgb, var(${statusConfig.color}) 50%, transparent)`;

		statusDot.append(halo);
	}

	const statusText = document.createElement('span');
	statusText.textContent = statusConfig.label;
	statusText.className = 'text-xs 2xl:text-sm';

	status.append(statusDot, statusText);

	// Task Priority
	let priorityConfig = TASK_PRIORITY[task.priority as TaskPriority];
	if (!priorityConfig) priorityConfig = TASK_PRIORITY.medium;

	const priority = document.createElement('div');
	priority.textContent = priorityConfig.label;
	priority.className = 'rounded-full px-2 py-0.5 text-xs';
	priority.style.color = `var(${priorityConfig.color})`;
	priority.style.backgroundColor = `color-mix(in srgb, var(${priorityConfig.color}) 10%, transparent)`;

	attributes.append(status, priority);

	// === TASK CONTENT ===
	const taskContent = document.createElement('div');
	taskContent.className = cn(layout.col, 'flex-1 gap-2 p-3', task.completed && 'opacity-30');

	const taskDescription = document.createElement('p');
	taskDescription.textContent = task.description;
	taskDescription.className =
		'line-clamp-3 cursor-default overflow-hidden text-justify text-sm leading-[18px] text-ellipsis text-(--color-secondary) select-none';

	const timestamp = document.createElement('div');
	timestamp.textContent = fullDate(task.createdAt);
	timestamp.title = 'Дата создания';
	timestamp.className = cn(primitives.hint, 'px-3 pb-3 text-xs leading-4 xl:text-xs', task.completed && 'opacity-30');

	taskContent.append(attributes, taskDescription);

	// === ACTION FUNCTIONS ===
	function onViewTask() {
		viewTaskModal?.close();

		viewTaskModal = viewTask({
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
				viewTaskModal = null;
			},
		});

		document.body.append(viewTaskModal.element);
	}

	function onEditTask() {
		editTaskModal?.close();

		editTaskModal = editTask({
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
				editTaskModal = null;
			},
		});

		document.body.append(editTaskModal.element);
	}

	function onDeleteTask() {
		deleteTaskModal?.close();

		deleteTaskModal = deleteDialog(
			'Удаление задачи',
			`Вы уверены, что хотите удалить задачу <span style="color: var(--accent-default)"><strong>${task.title}</strong></span>?`,
			() => {
				state.deleteTask(task.id);
				deleteTaskModal = null;
			}
		);

		document.body.append(deleteTaskModal.element);
	}

	function createOption(index: number, icon: string, title: string, callback: () => void) {
		const roundedVariants = ['hover:rounded-t-xl', 'hover:rounded-none', 'hover:rounded-b-xl'] as const;

		const option = document.createElement('button');
		option.className = cn(
			layout.row,
			'w-full cursor-pointer gap-3 px-5 py-3 text-left text-base hover:bg-(--accent-hover) hover:text-(--accent-text) xl:gap-2 xl:px-3 xl:py-2 xl:text-sm 2xl:text-base',
			roundedVariants[index]
		);
		insertSvg(option, icon, 'size-4');
		option.append(title);
		option.addEventListener('click', () => {
			optionsMenu.classList.add('hidden');
			callback();
		});

		return { option, callback };
	}

	function updateDraggable() {
		taskCard.draggable = deviceUtils.getDevice() === 'mobile';
		taskTitle.draggable = deviceUtils.getDevice() === 'desktop';
	}

	updateDraggable();

	const unsubscribeDevice = deviceUtils.onDeviceChange(updateDraggable);

	function cleanup() {
		optionsButton.removeEventListener('click', onOptionsButtonClick);
		document.removeEventListener('click', onDocumentClick);
		optionInstances.forEach(({ option, callback }) => option.removeEventListener('click', callback));

		unsubscribeDevice();
	}

	function destroy() {
		if (isDestroyed) return;
		isDestroyed = true;

		cleanup();

		viewTaskModal?.close();
		viewTaskModal = null;

		editTaskModal?.close();
		editTaskModal = null;

		deleteTaskModal?.close();
		deleteTaskModal = null;
	}

	// === ASSEMBLY ===
	taskCard.append(taskHeader, taskContent, timestamp);

	return { element: taskCard, destroy };
};
