import addIcon from '@/shared/assets/icons/actions/add.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg, LIMITS } from '../lib';
import { type Column, createState, enableMouseScroll, setupDnD, type Task } from '../model';
import { button, createColumn, createTaskCard, editColumn, layout } from '.';

type BoardInstance = { element: HTMLElement; destroy: () => void };

export const createBoard = (state: ReturnType<typeof createState>): BoardInstance => {
	let isDestroyed = false;

	let lastTasks: Task[] = [];
	let columnModal: ReturnType<typeof editColumn> | null = null;

	const columnInstances = new Map<string, ReturnType<typeof createColumn>>();
	const taskInstances = new Map<string, ReturnType<typeof createTaskCard>>();

	// === BOARD ===
	const board = document.createElement('div');
	board.className = cn(
		layout.row,
		'h-full max-w-full min-w-0 items-start gap-4 overflow-x-auto xl:overflow-y-hidden'
	);

	// === COLUMNS CONTAINER ===
	const columnsContainer = document.createElement('div');
	columnsContainer.className = cn(layout.row, 'size-full items-start gap-4');
	columnsContainer.dataset.columnsContainer = '';

	// === ADD COLUMN BUTTON ===
	const addColumnButton = document.createElement('button');
	addColumnButton.title = 'Добавить колонку';
	addColumnButton.className = cn(button.ghost, 'ml-auto h-full shrink-0 p-0 xl:h-[61px]');
	addColumnButton.addEventListener('click', onAddColumn);
	insertSvg(addColumnButton, addIcon, 'size-4');

	// === ACTION FUNCTIONS ===
	function renderColumns(columns: Column[], tasks: Task[]) {
		const actualColumns = new Set(columns.map((column) => column.id));

		for (const columnId of columnInstances.keys()) {
			if (!actualColumns.has(columnId)) destroyColumnInstance(columnId);
		}

		columns.forEach((column) => {
			let instance = columnInstances.get(column.id);
			const tasksCount = tasks.filter((task) => task.columnId === column.id).length;

			if (!instance) {
				instance = createColumn(column, state);
				columnInstances.set(column.id, instance);

				columnsContainer.append(instance.element);
			} else instance.update(column, tasksCount);
		});

		columnsContainer.append(addColumnButton);
	}

	function renderTasks(tasks: Task[]) {
		for (const taskId of [...taskInstances.keys()]) destroyTaskInstance(taskId);

		for (const columnInstance of columnInstances.values()) {
			const columnElement = columnInstance.element;
			const columnId = columnElement.dataset.columnId;
			const tasksContainer = columnElement.querySelector('[data-tasks-container]') as HTMLElement | null;
			if (!columnId || !tasksContainer) continue;

			const tasksInColumn = tasks
				.filter((task) => task.columnId === columnId)
				.sort((a, b) => {
					if (a.completed && !b.completed) return 1;
					if (!a.completed && b.completed) return -1;
					return a.position - b.position;
				});

			tasksInColumn.forEach((task) => {
				const card = createTaskCard(task, state);
				taskInstances.set(task.id, card);

				tasksContainer.append(card.element);
			});

			const columnsData = state.getColumns();
			const columnData = columnsData.find((column) => column.id === columnId);

			const limit = columnData?.taskLimit ?? Infinity;
			const isLimitReached = tasksInColumn.length >= limit;

			const counter = columnElement.querySelector('[data-tasks-counter]') as HTMLElement | null;
			if (counter) counter.textContent = `Задач: ${tasksInColumn.length} / ${limit === Infinity ? '∞' : limit}`;

			const addTaskButton = columnElement.querySelector('[data-task-add]') as HTMLElement | null;
			if (addTaskButton) addTaskButton.classList.toggle('hidden', isLimitReached);
		}
	}

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

		for (const taskId of taskIdsInColumn) destroyTaskInstance(taskId);

		instance.destroy();
		instance.element.remove();
		columnInstances.delete(columnId);
	}

	// === ASSEMBLY ===
	board.append(columnsContainer);

	// === SUBSCRIBE ===
	const destroyDnD = setupDnD(
		board,
		(taskId, targetColumn, newIndex) => state.moveTask(taskId, targetColumn, newIndex),
		(columnId, newIndex) => state.moveColumn(columnId, newIndex)
	);

	const destroyMouseScroll = enableMouseScroll(board);

	const unsubscribeColumns = state.subscribeColumns((columns) => {
		renderColumns(columns, lastTasks);
		addColumnButton.classList.toggle('hidden', columns.length >= LIMITS.MAX_COLUMNS);
	});

	const unsubscribeTasks = state.subscribeTasks((tasks) => {
		lastTasks = tasks;
		renderTasks(tasks);
	});

	return {
		element: board,
		destroy: () => {
			if (isDestroyed) return;
			isDestroyed = true;

			unsubscribeTasks();
			unsubscribeColumns();
			destroyDnD();
			destroyMouseScroll();
			addColumnButton.removeEventListener('click', onAddColumn);

			columnModal?.close();
			columnModal = null;

			for (const columnId of [...columnInstances.keys()]) destroyColumnInstance(columnId);

			board.remove();
		},
	};
};
