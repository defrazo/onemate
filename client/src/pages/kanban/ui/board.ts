import { addIcon, insertSvg } from '../lib';
import { type Column, createState, enableMouseScroll, LIMITS, setupDnD, type Task } from '../model';
import { createColumn, createTaskCard, editColumn } from '.';

export const createBoard = (state: ReturnType<typeof createState>) => {
	let isDestroyed = false;

	let lastTasks: Task[] = [];
	let columnModal: ReturnType<typeof editColumn> | null = null;

	const columnInstances = new Map<string, ReturnType<typeof createColumn>>();
	const taskInstances = new Map<string, ReturnType<typeof createTaskCard>>();

	// === BOARD ===
	const board = document.createElement('div');
	board.className = 'flex h-full max-w-full min-w-0 items-start gap-4 overflow-x-auto xl:overflow-y-hidden';

	// === COLUMNS CONTAINER ===
	const columnsContainer = document.createElement('div');
	columnsContainer.className = 'flex size-full items-start gap-4';
	columnsContainer.dataset.columnsContainer = '';

	// === ADD COLUMN BUTTON ===
	const addColumnButton = document.createElement('button');
	addColumnButton.type = 'button';
	addColumnButton.title = 'Добавить колонку';
	addColumnButton.className =
		'flex h-[39px] w-5.5 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-(--border-color) p-0 px-2 py-1 transition-colors hover:border-transparent hover:bg-(--accent-hover) hover:text-(--accent-text) xl:h-[43px]';
	insertSvg(addColumnButton, addIcon, 'size-4 shrink-0');

	// === RENDER COLUMNS ===
	function renderColumns(columns: Column[], tasks: Task[]) {
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
				columnsContainer.append(instance.element);
			}

			instance.update(column, tasksCount);
		}

		columnsContainer.append(addColumnButton);

		addColumnButton.classList.toggle('hidden', columns.length === 0 || columns.length >= LIMITS.MAX_COLUMNS);
	}

	// === RENDER TASKS ===
	function renderTasks(tasks: Task[]) {
		for (const taskId of [...taskInstances.keys()]) {
			destroyTaskInstance(taskId);
		}

		for (const columnInstance of columnInstances.values()) {
			const columnId = columnInstance.element.dataset.columnId;
			if (!columnId) continue;

			const tasksInColumn = tasks
				.filter((task) => task.columnId === columnId)
				.sort((a, b) => {
					if (a.completed && !b.completed) return 1;
					if (!a.completed && b.completed) return -1;
					return a.position - b.position;
				});

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

		columnModal = editColumn({
			mode: 'create',
			initial: { columnTitle: '', limit: 10, color: 'slate' },
			onSubmit: (columnTitle, color, limit) => {
				state.addColumn(columnTitle, color, limit);
				columnModal = null;
			},
		});

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

	// === DND ===
	const destroyDnD = setupDnD(
		board,
		(taskId, targetColumn, newIndex) => state.moveTask(taskId, targetColumn, newIndex),
		(columnId, newIndex) => state.moveColumn(columnId, newIndex)
	);

	const destroyMouseScroll = enableMouseScroll(board);

	// === SUBSCRIPTIONS ===
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

		unsubscribeTasks();
		unsubscribeColumns();

		destroyDnD();
		destroyMouseScroll();

		addColumnButton.removeEventListener('click', onAddColumn);

		columnModal?.close();
		columnModal = null;

		for (const columnId of [...columnInstances.keys()]) {
			destroyColumnInstance(columnId);
		}

		board.remove();
	}

	return { element: board, destroy };
};
