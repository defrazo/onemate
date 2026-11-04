import { addIcon, insertSvg } from '../lib';
import { type Column, type createState, enableMouseScroll, LIMITS, setupDnD, sortTasks, type Task } from '../model';
import { createColumn, createTaskCard, editColumn } from '.';

export const createBoard = (state: ReturnType<typeof createState>) => {
	let isDestroyed = false;

	let lastTasks: Task[] = [];
	let deferredRender = false;
	let columnModal: ReturnType<typeof editColumn> | null = null;

	const columnInstances = new Map<string, ReturnType<typeof createColumn>>();
	const taskInstances = new Map<string, ReturnType<typeof createTaskCard>>();

	// === BOARD ===
	const board = document.createElement('div');
	board.className = 'core-gap flex h-full max-w-full min-w-0 items-start overflow-x-auto xl:overflow-y-hidden';

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
		'flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--border-primary) text-(--text-secondary) transition-colors hover:bg-(--bg-secondary)';
	emptyBoard.textContent = 'Добавить первую колонку';

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
				const card = createTaskCard(task, state);
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
