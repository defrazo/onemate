import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn, fullDate } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, deviceUtils, insertSvg } from '../lib';
import { type Column, createState } from '../model';
import { button, editColumnDialog, editTaskDialog, layout, primitives } from '.';

export const createColumn = (column: Column, state: ReturnType<typeof createState>): HTMLElement => {
	const device = deviceUtils.getDevice();

	// === COLUMN ===
	const container = document.createElement('div');
	container.dataset.columnId = column.id;
	container.className = cn(
		layout.col,
		'gap-6 border h-full border-transparent snap-start flex-1 min-w-[260px] max-w-[350px]'
	);

	// === HEADER ===
	const header = document.createElement('div');
	header.dataset.header = '';
	header.dataset.columnDragHandle = '';
	header.draggable = device === 'desktop' && !state.isMovingColumn;
	header.className = cn(layout.col, 'gap-1 pb-2', state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');
	header.style.borderBottomColor = COLUMN_COLORS[(column.color ?? 'slate') as ColumnColor];
	header.style.borderBottomWidth = '3px';

	// === TITLE ===
	const titleRow = document.createElement('div');
	titleRow.className = cn(layout.row, 'min-w-0 justify-between');

	const title = document.createElement('h2');
	title.textContent = column.title.toUpperCase();
	title.dataset.title = '';
	title.className = primitives.title;

	const settingsButton = document.createElement('button');
	settingsButton.type = 'button';
	settingsButton.title = 'Настройки колонки';
	settingsButton.className = cn(button.icon, 'text-(--color-secondary)');
	settingsButton.addEventListener('click', () =>
		onEditColumn(column.id, column.title, column.color, column.taskLimit)
	);
	insertSvg(settingsButton, settingsIcon, 'size-5');

	titleRow.append(title, settingsButton);

	// === TASKS ACTIONS ===
	const tasksRow = document.createElement('div');
	tasksRow.className = cn(layout.row, 'justify-between');

	const counter = document.createElement('div');
	counter.textContent = `Задач: 0 / ${column.taskLimit ?? '∞'}`;
	counter.dataset.count = '';
	counter.className = primitives.hint;

	const addTaskButton = document.createElement('button');
	addTaskButton.type = 'button';
	addTaskButton.title = 'Добавить задачу';
	addTaskButton.dataset.addTask = '';
	addTaskButton.className = cn(button.default, 'w-[52px] justify-center py-0.5');
	addTaskButton.addEventListener('click', () => onAddTask(column.id, column.taskLimit));
	insertSvg(addTaskButton, addIcon, 'size-4 mx-auto');

	tasksRow.append(counter, addTaskButton);

	header.append(titleRow, tasksRow);

	// === TASKS CONTAINER ===
	const tasksContainer = document.createElement('div');
	tasksContainer.dataset.column = column.title;
	tasksContainer.dataset.columnId = column.id;
	tasksContainer.dataset.tasks = '';
	tasksContainer.className = cn(
		layout.col,
		'flex-1 gap-4 hide-scrollbar landscape:min-h-[150vh] sm:max-h-fit xl:max-h-[calc(100vh-145px)]'
	);

	// === ACTION FUNCTIONS ===
	const onAddTask = (columnId: string, taskLimit: number) => {
		const today = new Date().toISOString().split('T')[0];
		const createdAt = fullDate(new Date().toISOString());

		const modal = editTaskDialog({
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

		document.body.append(modal);
	};

	const onEditColumn = (id: string, columnName: string, color: ColumnColor, limit: number) => {
		const modal = editColumnDialog({
			mode: 'edit',
			initial: { columnName, limit, color },
			onSubmit: (columnName, limit, color) => state.editColumn(id, columnName, color, limit),
			onDelete: () => state.deleteColumn(id),
		});

		document.body.append(modal);
	};

	const updateDraggable = () => {
		header.draggable = deviceUtils.getDevice() === 'desktop' && !state.isMovingColumn;
		header.className = cn(layout.col, 'gap-1 pb-2', state.isMovingColumn ? 'cursor-progress' : 'cursor-grab');
	};

	deviceUtils.onDeviceChange((device) => (header.draggable = device === 'desktop'));
	deviceUtils.onDeviceChange(updateDraggable);

	state.subscribeColumns(updateDraggable);

	// === ASSEMBLY ===
	container.append(header, tasksContainer);

	return container;
};
