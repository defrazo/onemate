import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../lib';
import { type Column, createState, setupDnD, type Task } from '../model';
import { controls, createColumn, createTaskCard, editColumnDialog, layout } from '.';

type BoardInstance = {
	board: HTMLDivElement;
	destroy: () => void;
};

export const createBoard = (state: ReturnType<typeof createState>): BoardInstance => {
	const board = document.createElement('div');
	board.className = cn(layout.row, 'gap-4 size-full');

	// === COLUMNS ===
	const columnsContainer = document.createElement('div');
	columnsContainer.className = cn(layout.row, 'flex-1 gap-4 size-full');
	columnsContainer.dataset.columns = '';

	const renderColumns = (columns: Column[]) => {
		columnsContainer.innerHTML = '';

		columns.forEach((column) => {
			const col = createColumn(column, state);
			columnsContainer.append(col);
		});
	};

	// === ADD COLUMN BUTTON ===
	const addColumnButton = document.createElement('button');
	addColumnButton.className = cn(
		controls.iconButton,
		'rounded-xl border border-dashed transition-colors border-(--border-color) hover:text-(--accent-text) hover:bg-(--accent-hover-op)'
	);
	addColumnButton.addEventListener('click', () => onAddColumn());
	insertSvg(addColumnButton, addIcon, 'size-4');

	// === ASSEMBLY ===
	board.append(columnsContainer, addColumnButton);

	setupDnD(
		board,
		(taskId, targetColumn, newIndex) => state.moveTask(taskId, targetColumn, newIndex),
		(columnId, newIndex) => state.moveColumn(columnId, newIndex)
	);

	// === ACTION FUNCTIONS ===
	const onAddColumn = () => {
		const modal = editColumnDialog({
			mode: 'create',
			initialData: { columnName: 'Новая колонка', limit: 10, color: 'yellow' },
			onSubmit: (columnName, limit, color) => state.addColumn(columnName, limit, color),
			onDelete: () => {},
		});

		document.body.append(modal);
	};

	// === SUBSCRIBE ===
	const unsubscribeColumns = state.subscribeColumns((columns) => {
		renderColumns(columns);
	});

	const unsubscribeTasks = state.subscribeTasks((tasks) => {
		updateBoard(board, tasks, state);
	});

	return {
		board,
		destroy: () => {
			unsubscribeTasks();
			unsubscribeColumns();
		},
	};
};

export const updateBoard = (board: HTMLElement, tasks: Task[], state: ReturnType<typeof createState>) => {
	const columnsContainer = board.querySelector('[data-columns]') as HTMLElement;
	if (!columnsContainer) return;

	const columns = Array.from(columnsContainer.children) as HTMLElement[];

	columns.forEach((column) => {
		const columnName = column.dataset.column;
		const tasksContainer = column.querySelector('[data-tasks]') as HTMLElement;
		if (!tasksContainer) return;

		tasksContainer.innerHTML = '';

		const tasksInColumn = tasks.filter((task) => task.col === columnName).sort((a, b) => a.position - b.position);

		tasksInColumn.forEach((task) => {
			const card = createTaskCard(task, state);
			tasksContainer.append(card);
		});

		const columnsData = state.getColumns();
		const columnData = columnsData.find((col) => col.title === columnName);

		const countElement = column.querySelector('[data-count]') as HTMLElement;
		if (countElement)
			countElement.textContent = `Всего: ${tasksInColumn.length}. Максимум: ${columnData?.taskLimit ?? '∞'}`;
	});
};
