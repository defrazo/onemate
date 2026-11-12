import { addIcon } from '../lib/icons';
import { insertSvg } from '../lib/utils';
import { LIMITS } from '../model/constants';
import { enableMouseScroll, setupDnD } from '../model/dnd';
import { sortTasks } from '../model/sortTasks';
import type { createState } from '../model/state';
import type { Column, Task } from '../model/types';
import { createColumn } from './column/createColumn';
import { editColumn } from './column/edit/editColumn';
import { createTask } from './task/createTask';

export const createBoard = (state: ReturnType<typeof createState>) => {
	let isDestroyed = false;

	let lastTasks: Task[] = [];
	let deferredRender = false;
	let columnModal: ReturnType<typeof editColumn> | null = null;

	const columnInstances = new Map<string, ReturnType<typeof createColumn>>();
	const taskInstances = new Map<string, ReturnType<typeof createTask>>();

	// === BOARD ===
	const board = document.createElement('div');
	board.className =
		'core-gap core-scrollbar flex h-full max-w-full min-w-0 items-start overflow-x-auto xl:overflow-y-hidden';

	// === COLUMNS CONTAINER ===
	const columnsContainer = document.createElement('div');
	columnsContainer.className = 'core-gap flex size-full items-start';
	columnsContainer.dataset.columnsContainer = '';

	// === ADD COLUMN BUTTON ===
	const addColumnButton = document.createElement('button');
	addColumnButton.type = 'button';
	addColumnButton.title = 'Добавить колонку';
	addColumnButton.className =
		'flex h-[39px] w-5.5 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-(--border-primary) p-0 px-2 py-1 transition-colors hover:border-transparent hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent) xl:h-[43px]';
	insertSvg(addColumnButton, addIcon, 'size-4 shrink-0');

	// === EMPTY BOARD ===
	const emptyBoard = document.createElement('button');
	emptyBoard.type = 'button';
	emptyBoard.className =
		'flex min-h-44 size-full cursor-pointer flex-col items-center justify-center rounded-xl border border-(--border-primary) bg-(--tone) px-4 py-6 text-center transition-colors hover:border-(--accent-primary) hover:bg-(--tone-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-primary)';

	const emptyIcon = document.createElement('span');
	emptyIcon.className =
		'mb-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--tone) text-(--accent-primary)';
	insertSvg(emptyIcon, addIcon, 'size-5');

	const emptyTitle = document.createElement('span');
	emptyTitle.className = 'text-sm font-medium text-(--text-primary)';
	emptyTitle.textContent = 'Доска пуста';

	const emptyDescription = document.createElement('span');
	emptyDescription.className = 'trim mt-0.5 text-xs text-(--text-secondary)';
	emptyDescription.textContent = 'Добавьте колонку, чтобы начать планирование';

	emptyBoard.append(emptyIcon, emptyTitle, emptyDescription);

	// === RENDER COLUMNS ===
	function renderColumns(columns: Column[], tasks: Task[]) {
		if (state.getBoardState().hasOpenEditor) {
			deferredRender = true;
			return;
		}

		const actualColumns = new Set(columns.map((column) => column.id));

		for (const columnId of columnInstances.keys()) {
			if (!actualColumns.has(columnId)) destroyColumnInstance(columnId);
		}

		for (const column of columns) {
			const tasksCount = tasks.filter((task) => task.columnId === column.id).length;

			let instance = columnInstances.get(column.id);

			if (!instance) {
				instance = createColumn(column, state);
				columnInstances.set(column.id, instance);
			}

			instance.update(column, tasksCount);
			columnsContainer.append(instance.element);
		}

		columnsContainer.append(addColumnButton, emptyBoard);

		const isEmpty = columns.length === 0;

		addColumnButton.classList.toggle('hidden', isEmpty || columns.length >= LIMITS.MAX_COLUMNS);
		emptyBoard.classList.toggle(
			'hidden',
			!isEmpty || state.getBoardState().loading || state.getBoardState().loadError
		);
	}

	// === RENDER TASKS ===
	function renderTasks(tasks: Task[]) {
		if (state.getBoardState().hasOpenEditor) {
			deferredRender = true;
			return;
		}

		for (const taskId of [...taskInstances.keys()]) {
			destroyTaskInstance(taskId);
		}

		for (const columnInstance of columnInstances.values()) {
			const columnId = columnInstance.element.dataset.columnId;
			if (!columnId) continue;

			const tasksInColumn = tasks.filter((task) => task.columnId === columnId).sort(sortTasks);

			for (const task of tasksInColumn) {
				const card = createTask(task, state);
				taskInstances.set(task.id, card);

				columnInstance.tasksContainer.append(card.element);
			}
		}
	}

	// === ACTION FUNCTIONS ===
	function onAddColumn() {
		columnModal?.close();

		let release = () => {};

		columnModal = editColumn({
			mode: 'create',
			initial: { columnTitle: '', limit: 10, color: 'slate' },
			onClose: () => {
				columnModal = null;
				release();
			},
			onSubmit: (columnTitle, color, limit) => state.addColumn(columnTitle, color, limit),
		});

		release = state.registerEditor(columnModal.close);
		document.body.append(columnModal.element);
	}

	// === LIFECYCLE ===
	function destroyTaskInstance(taskId: string) {
		const instance = taskInstances.get(taskId);
		if (!instance) return;

		instance.destroy();
		instance.element.remove();

		taskInstances.delete(taskId);
	}

	function destroyColumnInstance(columnId: string) {
		const instance = columnInstances.get(columnId);
		if (!instance) return;

		const taskIdsInColumn = lastTasks.filter((task) => task.columnId === columnId).map((task) => task.id);

		for (const taskId of taskIdsInColumn) {
			destroyTaskInstance(taskId);
		}

		instance.destroy();
		instance.element.remove();

		columnInstances.delete(columnId);
	}

	// === ASSEMBLY ===
	board.append(columnsContainer);

	// === EVENTS ===
	addColumnButton.addEventListener('click', onAddColumn);
	emptyBoard.addEventListener('click', onAddColumn);

	const destroyDnD = setupDnD(
		board,
		(taskId, targetColumn) => state.moveTask(taskId, targetColumn),
		(columnId, newIdx) => state.moveColumn(columnId, newIdx)
	);

	const destroyMouseScroll = enableMouseScroll(board);

	// === SUBSCRIPTIONS ===
	const unsubscribeBoards = state.subscribeBoards(() => {
		const { loading, loadError, hasOpenEditor } = state.getBoardState();

		if (deferredRender && !hasOpenEditor) {
			deferredRender = false;
			lastTasks = state.getTasks();
			renderColumns(state.getColumns(), lastTasks);
			renderTasks(lastTasks);
		}

		const isEmpty = state.getColumns().length === 0;

		emptyBoard.classList.toggle('hidden', loading || loadError || !isEmpty);
	});

	const unsubscribeColumns = state.subscribeColumns((columns) => renderColumns(columns, lastTasks));

	const unsubscribeTasks = state.subscribeTasks((tasks) => {
		lastTasks = tasks;

		renderColumns(state.getColumns(), tasks);
		renderTasks(tasks);
	});

	// === LIFECYCLE ===
	function destroy() {
		if (isDestroyed) return;
		isDestroyed = true;

		unsubscribeBoards();
		unsubscribeTasks();
		unsubscribeColumns();

		destroyDnD();
		destroyMouseScroll();

		addColumnButton.removeEventListener('click', onAddColumn);
		emptyBoard.removeEventListener('click', onAddColumn);

		columnModal?.close();
		columnModal = null;

		for (const columnId of [...columnInstances.keys()]) {
			destroyColumnInstance(columnId);
		}

		board.remove();
	}

	return { element: board, destroy };
};
