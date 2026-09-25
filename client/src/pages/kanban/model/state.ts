import { MESSAGES, notifier, now } from '../lib';
import type { Column, ColumnColor, IKanbanRepo, Task, TaskPriority, TaskStatus } from '.';
import { getDefaultColumns, getDefaultTasks, LIMITS } from '.';

type ColumnListener = (columns: Column[]) => void;
type TaskListener = (tasks: Task[]) => void;

const rollback = <T>(snapshot: T, restore: (snapshot: T) => void, notify: () => void) => {
	restore(snapshot);
	notify();
};

export const createState = (repo: IKanbanRepo) => {
	let isMovingTask = false;
	let isMovingColumn = false;

	// === COLUMNS ===
	let columns: Column[] = [];

	const columnListeners = new Set<ColumnListener>();

	const getColumns = () =>
		columns
			.slice()
			.sort((a, b) => a.position - b.position)
			.map((column) => ({ ...column }));

	const notifyColumns = () => {
		const sorted = getColumns();
		columnListeners.forEach((listener) => listener(sorted));
	};

	const fetchColumns = async () => {
		try {
			await setColumns(await repo.fetchColumns());
		} catch {
			notifier.setNotice(MESSAGES.columns.fetchError, 'error');
		}
	};

	const setColumns = async (fetched: Column[]) => {
		if (fetched.length === 0) {
			columns = (
				await Promise.all(
					getDefaultColumns().map((column) =>
						repo.addColumn({
							title: column.title,
							color: column.color,
							taskLimit: column.taskLimit,
							position: column.position,
						})
					)
				)
			).sort((a, b) => a.position - b.position);
		} else columns = fetched.map((column) => ({ ...column })).sort((a, b) => a.position - b.position);

		notifyColumns();
	};

	const addColumn = async (title: string, color: ColumnColor, taskLimit: number) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			if (title.length > LIMITS.COLUMN_TITLE) {
				notifier.setNotice(MESSAGES.columns.addTitleLimit, 'info');
				return;
			}

			if (columns.length >= LIMITS.MAX_COLUMNS) {
				notifier.setNotice(MESSAGES.columns.addLimit, 'info');
				return;
			}

			const position = columns.length > 0 ? Math.max(...columns.map((column) => column.position)) + 1000 : 1000;
			const newColumn = await repo.addColumn({ title, color, taskLimit, position });

			columns.push(newColumn);
			notifyColumns();
			// notifier.setNotice(MESSAGES.columns.added, 'success');
		} catch {
			notifier.setNotice(MESSAGES.columns.addError, 'error');
			rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const editColumn = async (id: string, title: string, color: ColumnColor, taskLimit: number) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			if (title.length > LIMITS.COLUMN_TITLE) {
				notifier.setNotice(MESSAGES.columns.updateTitleLimit, 'info');
				return;
			}

			columns = columns.map((column) => (column.id === id ? { ...column, title, color, taskLimit } : column));
			notifyColumns();

			await repo.editColumn(id, { title, color, taskLimit });
			// notifier.setNotice(MESSAGES.columns.updated, 'success');
		} catch {
			notifier.setNotice(MESSAGES.columns.updateError, 'error');
			rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const deleteColumn = async (id: string) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			if (columns.length <= LIMITS.MIN_COLUMNS) {
				notifier.setNotice(MESSAGES.columns.deleteLimit, 'info');
				return;
			}

			columns = columns.filter((column) => column.id !== id);

			notifyColumns();
			await repo.deleteColumn(id);
			notifier.setNotice(MESSAGES.columns.deleted, 'success');
		} catch {
			notifier.setNotice(MESSAGES.columns.deleteError, 'error');
			rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const moveColumn = async (id: string, newIndex: number) => {
		if (isMovingColumn) return;
		isMovingColumn = true;

		const snapshot = columns.map((column) => ({ ...column }));

		try {
			const sortedColumns = columns.slice().sort((a, b) => a.position - b.position);

			const column = sortedColumns.find((column) => column.id === id);
			if (!column) return;

			const oldIndex = sortedColumns.findIndex((column) => column.id === id);
			if (oldIndex === -1) return;

			const withoutMoved = sortedColumns.filter((column) => column.id !== id);
			const clampedIndex = Math.max(0, Math.min(newIndex, withoutMoved.length));

			let newPosition: number;

			if (withoutMoved.length === 0) newPosition = 1000;
			else if (clampedIndex === 0) newPosition = withoutMoved[0].position - 1000;
			else if (clampedIndex >= withoutMoved.length)
				newPosition = withoutMoved[withoutMoved.length - 1].position + 1000;
			else newPosition = (withoutMoved[clampedIndex - 1].position + withoutMoved[clampedIndex].position) / 2;

			if (column.position === newPosition) return;

			const movedColumn = { ...column, position: newPosition };
			const updated = [...withoutMoved];
			updated.splice(clampedIndex, 0, movedColumn);

			columns = updated;
			notifyColumns();

			await repo.moveColumn(id, newPosition);
			if (shouldNormalizeColumns()) await normalizeColumnPositions();
			// notifier.setNotice(MESSAGES.columns.moved, 'success');
		} catch {
			notifier.setNotice(MESSAGES.columns.moveError, 'error');
			rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		} finally {
			isMovingColumn = false;
			notifyColumns();
		}
	};

	const shouldNormalizeColumns = () => {
		const sorted = columns.slice().sort((a, b) => a.position - b.position);

		for (let i = 1; i < sorted.length; i++) {
			const gap = sorted[i].position - sorted[i - 1].position;
			if (gap < 1) return true;
		}

		return false;
	};

	const normalizeColumnPositions = async () => {
		const sorted = columns
			.slice()
			.sort((a, b) => a.position - b.position)
			.map((column, index) => ({ ...column, position: (index + 1) * 1000 }));

		columns = sorted;

		notifyColumns();
		await Promise.all(sorted.map((column) => repo.moveColumn(column.id, column.position)));
	};

	const subscribeColumns = (listener: ColumnListener) => {
		columnListeners.add(listener);
		listener(getColumns());
		return () => columnListeners.delete(listener);
	};

	// === TASKS ===
	let tasks: Task[] = [];

	const taskListeners = new Set<TaskListener>();

	const getTasks = () => tasks.map((task) => ({ ...task }));

	const notifyTasks = () => {
		const snapshot = getTasks();
		taskListeners.forEach((listener) => listener(snapshot));
	};

	const fetchTasks = async () => {
		try {
			await setTasks(await repo.fetchTasks());
		} catch {
			notifier.setNotice(MESSAGES.tasks.fetchError, 'error');
		}
	};

	const setTasks = async (fetched: Task[]) => {
		if (fetched.length === 0) {
			const defaultTasks = getDefaultTasks(columns.map((column) => column.id));

			tasks = await Promise.all(
				defaultTasks.map((task) =>
					repo.addTask({
						columnId: task.columnId,
						title: task.title,
						description: task.description,
						status: task.status,
						priority: task.priority,
						startDate: task.startDate,
						endDate: task.endDate,
						completed: task.completed,
						position: task.position,
					})
				)
			);
		} else tasks = fetched.map((task) => ({ ...task }));

		notifyTasks();
	};

	const addTask = async (
		columnId: string,
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		startDate: string,
		endDate: string | null,
		completed: boolean,
		taskLimit: number
	) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			if (title.length > LIMITS.TASK_TITLE) {
				notifier.setNotice(MESSAGES.tasks.addTitleLimit, 'info');
				return;
			}

			const columnTasks = tasks.filter((task) => task.columnId === columnId);

			if (columnTasks.length + 1 > taskLimit) {
				notifier.setNotice(MESSAGES.tasks.addLimit, 'error');
				return;
			}

			const position =
				columnTasks.length > 0 ? Math.max(...columnTasks.map((task) => task.position)) + 1000 : 1000;

			const newTask = await repo.addTask({
				columnId,
				title,
				description,
				status,
				priority,
				startDate,
				endDate,
				completed,
				position,
			});

			tasks.push(newTask);

			notifyTasks();
			// notifier.setNotice(MESSAGES.tasks.added, 'success');
		} catch {
			notifier.setNotice(MESSAGES.tasks.addError, 'error');
			rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const editTask = async (
		id: string,
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		startDate: string,
		endDate: string | null,
		completed: boolean
	) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			if (title.length > LIMITS.TASK_TITLE) {
				notifier.setNotice(MESSAGES.tasks.updateTitleLimit, 'info');
				return;
			}

			const updatedAt = now();

			tasks = tasks.map((task) =>
				task.id === id
					? { ...task, title, description, status, priority, startDate, endDate, completed, updatedAt }
					: task
			);
			notifyTasks();

			await repo.editTask(id, { title, description, status, priority, startDate, endDate, completed, updatedAt });
			// notifier.setNotice(MESSAGES.tasks.updated, 'success');
		} catch {
			notifier.setNotice(MESSAGES.tasks.updateError, 'error');
			rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const deleteTask = async (id: string) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			tasks = tasks.filter((task) => task.id !== id);

			notifyTasks();
			await repo.deleteTask(id);
			notifier.setNotice(MESSAGES.tasks.deleted, 'success');
		} catch {
			notifier.setNotice(MESSAGES.tasks.deleteError, 'error');
			rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const moveTask = async (id: string, newColumnId: string, newIndex: number) => {
		if (isMovingTask) return;
		isMovingTask = true;

		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			const task = tasks.find((task) => task.id === id);
			if (!task) return;

			const isSameColumn = task.columnId === newColumnId;

			const tasksInNewColumn = tasks
				.filter((task) => task.columnId === newColumnId)
				.sort((a, b) => a.position - b.position);

			const oldIndexInNewColumn = tasksInNewColumn.findIndex((task) => task.id === id);

			const isSamePosition = oldIndexInNewColumn === newIndex;

			if (isSameColumn && isSamePosition) return;

			if (!isSameColumn) {
				const columnData = columns.find((column) => column.id === newColumnId);

				if (tasksInNewColumn.length + 1 > (columnData?.taskLimit ?? Infinity)) {
					notifier.setNotice(MESSAGES.tasks.moveLimit, 'info');
					return;
				}
			}

			const withoutTask = tasks.filter((task) => task.id !== id);

			const columnTasks = withoutTask
				.filter((task) => task.columnId === newColumnId)
				.sort((a, b) => a.position - b.position);

			const clampedIndex = Math.max(0, Math.min(newIndex, columnTasks.length));

			let newPosition: number;

			if (columnTasks.length === 0) newPosition = 1000;
			else if (clampedIndex === 0) newPosition = columnTasks[0].position - 1000;
			else if (clampedIndex >= columnTasks.length)
				newPosition = columnTasks[columnTasks.length - 1].position + 1000;
			else newPosition = (columnTasks[clampedIndex - 1].position + columnTasks[clampedIndex].position) / 2;

			if (isSameColumn && task.position === newPosition) return;

			const updatedAt = now();
			const updatedTask: Task = { ...task, columnId: newColumnId, position: newPosition, updatedAt };

			tasks = [...withoutTask, updatedTask];
			notifyTasks();

			await repo.moveTask(id, newColumnId, newPosition, updatedAt);
			if (shouldNormalizeTasksInColumn(newColumnId)) await normalizeTaskPositionsInColumn(newColumnId);

			// notifier.setNotice(MESSAGES.tasks.moved, 'success');
		} catch {
			notifier.setNotice(MESSAGES.tasks.moveError, 'error');
			rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		} finally {
			isMovingTask = false;
		}
	};

	const shouldNormalizeTasksInColumn = (columnId: string) => {
		const sorted = tasks
			.filter((task) => task.columnId === columnId)
			.slice()
			.sort((a, b) => a.position - b.position);

		for (let i = 1; i < sorted.length; i++) {
			const gap = sorted[i].position - sorted[i - 1].position;
			if (gap < 0.01) return true;
		}

		return false;
	};

	const normalizeTaskPositionsInColumn = async (columnId: string) => {
		const updatedAt = now();

		const sortedColumnTasks = tasks
			.filter((task) => task.columnId === columnId)
			.slice()
			.sort((a, b) => a.position - b.position)
			.map((task, index) => ({ ...task, position: (index + 1) * 1000, updatedAt }));

		const otherTasks = tasks.filter((task) => task.columnId !== columnId);
		tasks = [...otherTasks, ...sortedColumnTasks];

		notifyTasks();

		await Promise.all(
			sortedColumnTasks.map((task) => repo.moveTask(task.id, task.columnId, task.position, task.updatedAt))
		);
	};

	const subscribeTasks = (listener: TaskListener) => {
		taskListeners.add(listener);
		listener(getTasks());
		return () => taskListeners.delete(listener);
	};

	// === LOAD ===

	const loadData = async () => {
		const [fetchedColumns, fetchedTasks] = await Promise.all([repo.fetchColumns(), repo.fetchTasks()]);

		await setColumns(fetchedColumns);
		await setTasks(fetchedTasks);
	};

	return {
		loadData,

		fetchColumns,
		fetchTasks,

		addColumn,
		editColumn,
		moveColumn,
		deleteColumn,

		addTask,
		editTask,
		moveTask,
		deleteTask,

		getColumns,
		getTasks,

		subscribeColumns,
		subscribeTasks,

		get isMovingColumn() {
			return isMovingColumn;
		},

		get isMovingTask() {
			return isMovingTask;
		},
	};
};
