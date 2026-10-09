import { cn } from '@/shared/lib/utils';

import { calendarDueIcon, calendarIcon, createSvg, deleteIcon, deviceUtils, insertSvg } from '../../lib';
import type { createState, Task } from '../../model';
import { createConfirmDialog } from '../components';
import { createTaskHeader, createTaskMeta, editTask, viewTask } from '.';

export const createTaskCard = (task: Task, state: ReturnType<typeof createState>) => {
	let isDestroyed = false;

	let viewTaskModal: ReturnType<typeof viewTask> | null = null;
	let editTaskModal: ReturnType<typeof editTask> | null = null;
	let deleteTaskModal: ReturnType<typeof createConfirmDialog> | null = null;

	// === TASK CARD ===
	const taskCard = document.createElement('div');
	taskCard.dataset.taskId = task.id;
	taskCard.className =
		'group/task flex min-h-40 min-w-0 flex-col gap-2 rounded-lg border border-(--tone) bg-(--tone-strong) transition-colors select-none hover:border-(--tone-strong-hover) hover:bg-(--tone-strong-hover)/70';

	// === TASK HEADER ===
	const taskHeader = createTaskHeader({ task, onView: onViewTask, onEdit: onEditTask, onDelete: onDeleteTask });

	// === TASK CONTENT ===
	const taskContent = document.createElement('div');
	taskContent.className = cn('flex flex-1 flex-col gap-2 px-3', task.completed && 'opacity-30');

	// task meta
	const taskMeta = createTaskMeta(task);

	// task description
	const taskDescription = document.createElement('p');
	taskDescription.textContent = task.description;
	taskDescription.className =
		'line-clamp-3 overflow-hidden text-sm leading-4.5 text-ellipsis text-(--text-secondary)';

	taskContent.append(taskMeta.element, taskDescription);

	// === TIMESTAMP ===
	const timestamp = document.createElement('div');
	timestamp.className = 'mt-auto flex items-center justify-between gap-2 px-3 pb-3 text-xs text-(--text-disabled)';

	const formatShortDate = (value: string): string => {
		const date = new Date(value);
		return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
	};

	const createDateLabel = (icon: string, date: string, title: string) => {
		const element = document.createElement('span');
		element.title = title;
		element.className = 'flex min-w-0 items-center gap-1';

		insertSvg(element, icon, 'size-3.5 shrink-0');

		const text = document.createElement('span');
		text.textContent = formatShortDate(date);
		text.className = 'trim mt-px';

		element.append(text);

		return element;
	};

	timestamp.append(createDateLabel(calendarIcon, task.startDate, `Начало периода: ${task.startDate}`));

	if (task.endDate) {
		const deadline = createDateLabel(calendarDueIcon, task.endDate, `Срок выполнения: ${task.endDate}`);
		deadline.classList.add('shrink-0');

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const dueDate = new Date(`${task.endDate.slice(0, 10)}T00:00:00`);
		const isOverdue = !task.completed && dueDate < today;
		if (isOverdue) deadline.classList.add('line-through', 'decoration-(--text-tertiary)');

		timestamp.append(deadline);
	}

	// === ACTION FUNCTIONS ===
	function onViewTask() {
		viewTaskModal?.close();

		viewTaskModal = viewTask({
			initial: {
				title: task.title,
				description: task.description,
				status: task.status,
				priority: task.priority,
				startDate: task.startDate,
				endDate: task.endDate,
				completed: task.completed,
				created: task.createdAt,
				updated: task.updatedAt,
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
					completed
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
			},
			onSubmit: (title, description, status, priority, startDate, endDate) => {
				state.editTask(task.id, title, description, status, priority, startDate, endDate);
				editTaskModal = null;
			},
		});

		document.body.append(editTaskModal.element);
	}

	function onDeleteTask() {
		deleteTaskModal?.close();

		const content = document.createElement('span');

		content.append('Вы уверены, что хотите удалить задачу ');

		const taskTitle = document.createElement('strong');
		taskTitle.textContent = task.title;
		taskTitle.className = 'text-(--accent-primary)';

		content.append(taskTitle, '?');

		deleteTaskModal = createConfirmDialog({
			title: 'Удаление задачи',
			content,
			icon: createSvg(deleteIcon, 'size-5'),
			confirmText: 'Удалить',
			onConfirm: () => {
				state.deleteTask(task.id);
				deleteTaskModal = null;
			},
		});

		document.body.append(deleteTaskModal.element);
	}

	// === DRAGGABLE ===
	function updateDraggable() {
		taskCard.draggable = deviceUtils.getDevice() === 'mobile';
		taskHeader.dragHandle.draggable = deviceUtils.getDevice() === 'desktop';
	}

	updateDraggable();

	const unsubscribeDevice = deviceUtils.onDeviceChange(updateDraggable);

	// === LIFECYCLE ===
	function cleanup() {
		taskHeader.destroy();
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
	taskCard.append(taskHeader.element, taskContent, timestamp);

	return { element: taskCard, destroy };
};
