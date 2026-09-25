import { cn, fullDate } from '@/shared/lib/utils';

import { createSvg, deleteIcon, deviceUtils } from '../../lib';
import { createState, type Task } from '../../model';
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
		'group/task flex min-h-40 min-w-0 flex-col gap-2 rounded-lg border border-white/4 bg-white/5 transition-colors select-none hover:border-white/8 hover:bg-white/7';

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
		'line-clamp-3 overflow-hidden text-sm leading-4.5 text-ellipsis text-(--color-secondary)';

	taskContent.append(taskMeta.element, taskDescription);

	// === TIMESTAMP ===
	const timestamp = document.createElement('span');
	timestamp.title = 'Дата создания';
	timestamp.textContent = fullDate(task.createdAt);
	timestamp.className = 'trim mt-auto px-3 pb-3 text-xs text-(--color-secondary) opacity-70';

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
				completed: task.completed,
			},
			onSubmit: (title, description, status, priority, startDate, endDate, completed) => {
				state.editTask(task.id, title, description, status, priority, startDate, endDate, completed);
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
		taskTitle.className = 'text-(--accent-default)';

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
