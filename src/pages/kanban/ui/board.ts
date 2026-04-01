import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import { cn } from '@/shared/lib/utils';

import { COLUMN_COLORS, insertSvg, LIMITS } from '../lib';
import { type Column, createState, enableMouseScroll, setupDnD, type Task } from '../model';
import { button, createColumn, createTaskCard, editColumnDialog, layout } from '.';

type BoardInstance = { board: HTMLDivElement; destroy: () => void };

export const createBoard = (state: ReturnType<typeof createState>): BoardInstance => {
	let lastTasks: Task[] = [];

	// === BOARD ===
	const board = document.createElement('div');
	board.className = cn(
		layout.row,
		'gap-4 min-w-0 items-start overflow-x-auto max-w-full hide-scrollbar xl:overflow-y-hidden h-full'
	);

	// === COLUMNS CONTAINER ===
	const columnsContainer = document.createElement('div');
	columnsContainer.className = cn(layout.row, 'items-start w-full h-full gap-4');
	columnsContainer.dataset.columns = '';

	const renderColumns = (columns: Column[], tasks: Task[]) => {
		const actualColumns = new Set(columns.map((column) => column.id));

		Array.from(columnsContainer.querySelectorAll('[data-column-id]')).forEach((node) => {
			const element = node as HTMLElement;
			const id = element.dataset.columnId;
			if (!id || !actualColumns.has(id)) element.remove();
		});

		columns.forEach((column) => {
			let existingColumn = columnsContainer.querySelector(`[data-column-id="${column.id}"]`) as HTMLElement;

			if (existingColumn) {
				const title = existingColumn.querySelector('[data-title]') as HTMLElement;
				if (title) title.textContent = column.title.toUpperCase();

				const header = existingColumn.querySelector('[data-header]') as HTMLElement;
				if (header) header.style.borderBottomColor = COLUMN_COLORS[column.color];

				const countEl = existingColumn.querySelector('[data-count]') as HTMLElement;
				if (countEl) {
					const tasksInColumn = tasks.filter((task) => task.columnId === column.id);
					countEl.textContent = `Задач: ${tasksInColumn.length} / ${column.taskLimit ?? '∞'}`;
				}
			} else {
				const col = createColumn(column, state);
				columnsContainer.append(col);
			}
		});

		columnsContainer.append(addColumnButton);
	};

	// === ADD COLUMN BUTTON ===
	const addColumnButton = document.createElement('button');
	addColumnButton.title = 'Добавить колонку';
	addColumnButton.className = cn(button.ghost, 'h-full ml-auto shrink-0 xl:h-[61px] p-0');
	addColumnButton.addEventListener('click', onAddColumn);
	insertSvg(addColumnButton, addIcon, 'size-4');

	// === ACTION FUNCTIONS ===
	function onAddColumn() {
		const modal = editColumnDialog({
			mode: 'create',
			initial: { columnName: '', limit: 10, color: 'slate' },
			onSubmit: (columnName, limit, color) => state.addColumn(columnName, limit, color),
			onDelete: () => {},
		});

		document.body.append(modal);
	}

	// === ASSEMBLY ===
	board.append(columnsContainer);

	// === SUBSCRIBE ===
	setupDnD(
		board,
		(taskId, targetColumn, newIndex) => state.moveTask(taskId, targetColumn, newIndex),
		(columnId, newIndex) => state.moveColumn(columnId, newIndex)
	);

	const destroyMouseScroll = enableMouseScroll(board);

	const unsubscribeColumns = state.subscribeColumns((columns) => {
		renderColumns(columns, lastTasks);

		if (columns.length >= LIMITS.MAX_COLUMNS) addColumnButton.classList.add('hidden');
		else addColumnButton.classList.remove('hidden');
	});

	const unsubscribeTasks = state.subscribeTasks((tasks) => {
		lastTasks = tasks;
		updateBoard(board, tasks, state);
	});

	return {
		board,
		destroy: () => {
			unsubscribeTasks();
			unsubscribeColumns();
			destroyMouseScroll();
		},
	};
};

export const updateBoard = (board: HTMLElement, tasks: Task[], state: ReturnType<typeof createState>) => {
	const columnsContainer = board.querySelector('[data-columns]') as HTMLElement;
	if (!columnsContainer) return;

	const columns = Array.from(columnsContainer.children) as HTMLElement[];

	columns.forEach((column) => {
		const columnId = column.dataset.columnId;
		const tasksContainer = column.querySelector('[data-tasks]') as HTMLElement;
		if (!tasksContainer) return;

		tasksContainer.innerHTML = '';

		const tasksInColumn = tasks
			.filter((task) => task.columnId === columnId)
			.sort((a, b) => {
				if (a.completed && !b.completed) return 1;
				if (!a.completed && b.completed) return -1;
				return a.position - b.position;
			});

		tasksInColumn.forEach((task) => {
			const card = createTaskCard(task, state);
			tasksContainer.append(card);
		});

		const columnsData = state.getColumns();
		const columnData = columnsData.find((column) => column.id === columnId);

		const limit = columnData?.taskLimit ?? Infinity;
		const isLimitReached = tasksInColumn.length >= limit;

		const countElement = column.querySelector('[data-count]') as HTMLElement;
		if (countElement) countElement.textContent = `Задач: ${tasksInColumn.length} / ${limit ?? '∞'}`;

		const addTaskButton = column.querySelector('[data-add-task]') as HTMLElement;
		if (addTaskButton) {
			if (isLimitReached) addTaskButton.classList.add('hidden');
			else addTaskButton.classList.remove('hidden');
		}
	});
};
