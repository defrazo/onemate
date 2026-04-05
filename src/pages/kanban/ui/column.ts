import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn, fullDate } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, deviceUtils, insertSvg } from '../lib';
import { type Column, createState } from '../model';
import { button, editColumn, editTask, layout, primitives } from '.';

type CreateColumnInstance = {
	element: HTMLElement;
	update: (column: Column, tasksCount: number) => void;
	destroy: () => void;
};

export const createColumn = (column: Column, state: ReturnType<typeof createState>): CreateColumnInstance => {
	let isDestroyed = false;
	let currentColumn = column;

	let editTaskModal: ReturnType<typeof editTask> | null = null;
	let editColumnModal: ReturnType<typeof editColumn> | null = null;

	// === COLUMN ===
	const container = document.createElement('div');
	container.dataset.columnId = column.id;
	container.className = cn(layout.col, 'h-full max-w-96 min-w-60 flex-1 gap-6');

	// === HEADER ===
	const header = document.createElement('div');
	header.dataset.columnHeader = '';
	header.dataset.columnDragHandle = '';
	header.className = cn(layout.col, 'gap-1 pb-2', state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');
	header.style.borderBottomColor = COLUMN_COLORS[(column.color ?? 'slate') as ColumnColor];
	header.style.borderBottomWidth = '3px';

	// === TITLE ===
	const titleRow = document.createElement('div');
	titleRow.className = cn(layout.row, 'min-w-0 justify-between');

	const title = document.createElement('h2');
	title.textContent = column.title.toUpperCase();
	title.dataset.columnTitle = '';
	title.className = cn(primitives.title, state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');

	const settingsButton = document.createElement('button');
	settingsButton.type = 'button';
	settingsButton.title = 'Настройки колонки';
	settingsButton.className = cn(button.icon, 'text-(--color-disabled)');

	const onEdit = () =>
		onEditColumn(currentColumn.id, currentColumn.title, currentColumn.color, currentColumn.taskLimit);

	settingsButton.addEventListener('click', onEdit);
	insertSvg(settingsButton, settingsIcon, 'size-5');

	titleRow.append(title, settingsButton);

	// === TASKS ACTIONS ===
	const tasksRow = document.createElement('div');
	tasksRow.className = cn(layout.row, 'justify-between');

	const counter = document.createElement('div');
	counter.textContent = `Задач: 0 / ${column.taskLimit ?? '∞'}`;
	counter.dataset.tasksCounter = '';
	counter.className = cn(primitives.hint, 'leading-5', state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');

	const addTaskButton = document.createElement('button');
	addTaskButton.type = 'button';
	addTaskButton.title = 'Добавить задачу';
	addTaskButton.dataset.taskAdd = '';
	addTaskButton.className = cn(button.default, 'w-[52px] justify-center py-0.5');

	const onAdd = () => onAddTask(currentColumn.id, currentColumn.taskLimit);

	addTaskButton.addEventListener('click', onAdd);
	insertSvg(addTaskButton, addIcon, 'size-4 mx-auto');

	tasksRow.append(counter, addTaskButton);

	header.append(titleRow, tasksRow);

	// === TASKS CONTAINER ===
	const tasksContainer = document.createElement('div');
	tasksContainer.dataset.tasksContainer = column.id;
	tasksContainer.className = cn(
		layout.col,
		'hide-scrollbar flex-1 gap-4 xl:max-h-[calc(100vh-225px)] xl:overflow-y-auto'
	);

	// === ACTION FUNCTIONS ===
	function onAddTask(columnId: string, taskLimit: number) {
		const today = new Date().toISOString().split('T')[0];
		const createdAt = fullDate(new Date().toISOString());

		editTaskModal?.close();

		editTaskModal = editTask({
			mode: 'create',
			initial: {
				title: '',
				description: '',
				status: 'active',
				priority: 'medium',
				startDate: today,
				endDate: null,
				completed: false,
			},
			onSubmit: (title, description, status, priority, startDate, endDate, completed) => {
				state.addTask(
					columnId,
					title,
					description,
					status,
					priority,
					startDate || today,
					endDate || null,
					completed,
					createdAt,
					taskLimit
				);
			},
		});

		document.body.append(editTaskModal.element);
	}

	function onEditColumn(id: string, columnTitle: string, color: ColumnColor, limit: number) {
		editColumnModal?.close();

		editColumnModal = editColumn({
			mode: 'edit',
			initial: { columnTitle, color, limit },
			onSubmit: (columnTitle, color, limit) => state.editColumn(id, columnTitle, color, limit),
			onDelete: () => state.deleteColumn(id),
		});

		document.body.append(editColumnModal.element);
	}

	function updateDraggable() {
		header.draggable = deviceUtils.getDevice() === 'desktop' && !state.isMovingColumn;
		header.className = cn(layout.col, 'gap-1 pb-2', state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');
	}

	function update(nextColumn: Column, tasksCount: number) {
		currentColumn = nextColumn;

		title.textContent = currentColumn.title.toUpperCase();
		header.style.borderBottomColor = COLUMN_COLORS[currentColumn.color ?? 'slate'];
		counter.textContent = `Задач: ${tasksCount} / ${currentColumn.taskLimit ?? '∞'}`;
	}

	const unsubscribeDevice = deviceUtils.onDeviceChange(updateDraggable);
	const unsubscribeColumns = state.subscribeColumns(updateDraggable);

	function cleanup() {
		addTaskButton.removeEventListener('click', onAdd);
		settingsButton.removeEventListener('click', onEdit);

		unsubscribeDevice();
		unsubscribeColumns();
	}

	function destroy() {
		if (isDestroyed) return;
		isDestroyed = true;

		cleanup();

		editTaskModal?.close();
		editTaskModal = null;

		editColumnModal?.close();
		editColumnModal = null;
	}

	// === ASSEMBLY ===
	container.append(header, tasksContainer);

	return { element: container, update, destroy };
};
