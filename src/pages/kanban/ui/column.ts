import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn, fullDate } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, insertSvg } from '../lib';
import { type Column, createState } from '../model';
import { controls, editColumnDialog, editTaskDialog, layout } from '.';

const availableHeight = window.innerHeight * 0.71;

export const createColumn = (column: Column, state: ReturnType<typeof createState>): HTMLElement => {
	// === COLUMN ===
	const container = document.createElement('div');
	container.dataset.column = column.title;
	container.dataset.columnId = column.id;
	container.className = cn(layout.col, 'gap-6 border-2 border-transparent flex-1');

	// === HEADER ===
	const header = document.createElement('div');
	header.className = cn(layout.col, 'gap-1 pb-2');
	header.style.borderBottomColor = COLUMN_COLORS[(column.color ?? 'slate') as ColumnColor];
	header.style.borderBottomWidth = '3px';

	// === TITLE ===
	const titleRow = document.createElement('div');
	titleRow.className = cn(layout.row, layout.between, '');

	const title = document.createElement('h2');
	title.textContent = column.title.toUpperCase();
	title.dataset.columnDragHandle = '';
	title.draggable = true;
	title.className = 'w-full text-left cursor-grab font-bold select-none';

	const settingsButton = document.createElement('button');
	settingsButton.type = 'button';
	settingsButton.className = cn(controls.iconButton, '');
	settingsButton.addEventListener('click', () =>
		onEditColumn(column.id, column.title, column.taskLimit, column.color)
	);
	insertSvg(settingsButton, settingsIcon, 'size-5');

	titleRow.append(title, settingsButton);

	// === TASKS ACTIONS ===
	const tasksRow = document.createElement('div');
	tasksRow.className = cn(layout.row, layout.between, '');

	const counter = document.createElement('div');
	counter.textContent = `Всего: 0. Максимум: ${column.taskLimit ?? '∞'}`;
	counter.dataset.count = '';
	counter.className = 'text-sm select-none text-(--color-secondary) opacity-70';

	const addTaskButton = document.createElement('button');
	addTaskButton.type = 'button';
	addTaskButton.className = cn(controls.iconButton, '');
	addTaskButton.addEventListener('click', () => onAddTask(column.title));
	insertSvg(addTaskButton, addIcon, 'size-5');

	tasksRow.append(counter, addTaskButton);

	header.append(titleRow, tasksRow);

	// === TASKS CONTAINER ===
	const tasksContainer = document.createElement('div');
	tasksContainer.dataset.column = column.title;
	tasksContainer.dataset.tasks = '';
	tasksContainer.className = cn(layout.col, 'flex-1 gap-4 overflow-y-auto hide-scrollbar');
	tasksContainer.style.maxHeight = `${availableHeight}px`;

	// === ACTION FUNCTIONS ===
	const onAddTask = (columnName: string) => {
		const today = new Date().toISOString().split('T')[0];
		const timestamp = fullDate(new Date().toISOString());

		const modal = editTaskDialog({
			mode: 'create',
			initialData: {
				title: '',
				description: '',
				status: 'active',
				priority: 'medium',
				startDate: today,
				endDate: null,
			},
			onSubmit: (title, description, status, priority, startDate, endDate) => {
				state.addTask(
					title,
					description,
					status,
					priority,
					columnName,
					timestamp,
					startDate || today,
					endDate || null
				);
			},
		});

		document.body.append(modal);
	};

	const onEditColumn = (id: string, columnName: string, limit: number, color: ColumnColor) => {
		const modal = editColumnDialog({
			mode: 'edit',
			initialData: { columnName, limit, color },
			onSubmit: (columnName, limit, color) => state.editColumn(id, columnName, limit, color),
			onDelete: () => state.deleteColumn(id),
		});

		document.body.append(modal);
	};

	// === ASSEMBLY ===
	container.append(header, tasksContainer);

	return container;
};
