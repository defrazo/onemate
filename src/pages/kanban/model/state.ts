import type { IKanbanRepo } from '../api';
import type { ColumnColor, TaskPriority, TaskStatus } from '../lib';
import { getDefaultColumns, getDefaultTasks, LIMITS, MESSAGES, notifier } from '../lib';
import type { Column, Task } from '.';

const fallback = <T>(snapshot: T, restore: (snapshot: T) => void, notify: () => void) => {
	restore(snapshot);
	notify();
};

export const createState = (repo: IKanbanRepo) => {
	let isMovingTask = false;
	let isMovingColumn = false;

	// === COLUMNS ===
	let columns: Column[] = [];
	let columnListeners: Array<(columns: Column[]) => void> = [];

	const getColumns = () =>
		columns
			.slice()
			.sort((a, b) => a.position - b.position)
			.map((column) => ({ ...column }));

	const notifyColumns = () => {
		const sorted = getColumns();
		columnListeners.forEach((callback) => callback(sorted));
	};

	const fetchColumns = async () => {
		try {
			const fetched = await repo.fetchColumns();

			if (!fetched || fetched.length === 0) {
				const added: Column[] = [];

				for (const column of getDefaultColumns()) {
					const newColumn = await repo.addColumn({
						title: column.title,
						color: column.color,
						taskLimit: column.taskLimit,
						position: column.position,
					});
					added.push(newColumn);
				}
				columns = added.sort((a, b) => a.position - b.position);
			} else columns = fetched.map((column) => ({ ...column })).sort((a, b) => a.position - b.position);

			notifyColumns();
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.fetchError, 'error');
		}
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
			notifier.setNotice(MESSAGES.columns.added, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.addError, 'error');
			fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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
			notifier.setNotice(MESSAGES.columns.updated, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.updateError, 'error');
			fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.deleteError, 'error');
			fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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

			notifier.setNotice(MESSAGES.columns.moved, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.moveError, 'error');
			fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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

	const subscribeColumns = (callback: (columns: Column[]) => void) => {
		columnListeners.push(callback);
		callback(getColumns());
		return () => (columnListeners = columnListeners.filter((listener) => listener !== callback));
	};

	// === TASKS ===
	let tasks: Task[] = [];
	let taskListeners: Array<(tasks: Task[]) => void> = [];

	const getTasks = () => tasks.map((task) => ({ ...task }));
	const notifyTasks = () => taskListeners.forEach((callback) => callback(tasks.map((task) => ({ ...task }))));

	const fetchTasks = async () => {
		try {
			const fetched = await repo.fetchTasks();

			if (!fetched || fetched.length === 0) {
				const added: Task[] = [];
				const defaultTasks = getDefaultTasks(columns.map((column) => column.id));

				for (const task of defaultTasks) {
					if (!task.columnId) continue;
					const newTask = await repo.addTask({
						columnId: task.columnId,
						title: task.title,
						description: task.description,
						status: task.status,
						priority: task.priority,
						startDate: task.startDate,
						endDate: task.endDate,
						completed: task.completed,
						position: task.position,
						createdAt: task.createdAt,
					});
					added.push(newTask);
				}
				tasks = added;
			} else tasks = fetched.map((tasks) => ({ ...tasks }));

			notifyTasks();
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.fetchError, 'error');
		}
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
		createdAt: string,
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
				createdAt,
			});

			tasks.push(newTask);
			notifyTasks();
			notifier.setNotice(MESSAGES.tasks.added, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.addError, 'error');
			fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
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
		completed: boolean,
		createdAt: string
	) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			if (title.length > LIMITS.TASK_TITLE) {
				notifier.setNotice(MESSAGES.tasks.updateTitleLimit, 'info');
				return;
			}

			tasks = tasks.map((task) =>
				task.id === id
					? { ...task, title, description, status, priority, startDate, endDate, completed, createdAt }
					: task
			);
			notifyTasks();

			await repo.editTask(id, {
				title,
				description,
				status,
				priority,
				startDate,
				endDate,
				completed,
				createdAt,
			});
			notifier.setNotice(MESSAGES.tasks.updated, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.updateError, 'error');
			fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const deleteTask = async (id: string) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			tasks = tasks.filter((task) => task.id !== id);
			notifyTasks();

			await repo.deleteTask(id);
			notifier.setNotice(MESSAGES.tasks.deleted, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.deleteError, 'error');
			fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const moveTask = async (id: string, newColumnId: string, newIndex: number) => {
		if (isMovingTask) return;
		isMovingTask = true;

		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			const task = tasks.find((task) => task.id === id);
			if (!task) return;

			const tasksInNewColumn = tasks.filter((task) => task.columnId === newColumnId);
			const oldIndexInNewColumn = tasksInNewColumn.findIndex((task) => task.id === id);

			const isSameColumn = task.columnId === newColumnId;
			const isSamePosition = oldIndexInNewColumn === newIndex;

			if (isSameColumn && isSamePosition) return;

			const columnData = columns.find((column) => column.id === newColumnId);

			if (tasksInNewColumn.length + 1 > (columnData?.taskLimit ?? Infinity)) {
				tasks = snapshot;
				notifyTasks();
				notifier.setNotice(MESSAGES.tasks.moveLimit, 'info');
				return;
			}

			const withoutTask = tasks.filter((task) => task.id !== id);
			const columnTasks = withoutTask.filter((task) => task.columnId === newColumnId);

			let newPosition: number;
			if (columnTasks.length === 0) newPosition = 1000;
			else if (newIndex === 0) newPosition = columnTasks[0].position - 1000;
			else if (newIndex >= columnTasks.length) newPosition = columnTasks[columnTasks.length - 1].position + 1000;
			else newPosition = (columnTasks[newIndex - 1].position + columnTasks[newIndex].position) / 2;

			if (task.columnId === newColumnId && task.position === newPosition) return;

			const updatedTask = { ...task, columnId: newColumnId, position: newPosition };
			withoutTask.splice(newIndex, 0, updatedTask);

			tasks = withoutTask;
			notifyTasks();

			await repo.moveTask(id, newColumnId, newPosition);

			if (shouldNormalizeTasksInColumn(newColumnId)) await normalizeTaskPositionsInColumn(newColumnId);

			notifier.setNotice(MESSAGES.tasks.moved, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.moveError, 'error');
			fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
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
		const sortedColumnTasks = tasks
			.filter((task) => task.columnId === columnId)
			.slice()
			.sort((a, b) => a.position - b.position)
			.map((task, index) => ({ ...task, position: (index + 1) * 1000 }));

		const otherTasks = tasks.filter((task) => task.columnId !== columnId);
		tasks = [...otherTasks, ...sortedColumnTasks];
		notifyTasks();

		await Promise.all(sortedColumnTasks.map((task) => repo.moveTask(task.id, task.columnId, task.position)));
	};

	const subscribeTasks = (callback: (tasks: Task[]) => void) => {
		taskListeners.push(callback);
		callback(tasks.map((task) => ({ ...task })));
		return () => (taskListeners = taskListeners.filter((listener) => listener !== callback));
	};

	const loadData = async () => {
		await fetchColumns();
		await fetchTasks();
	};

	return {
		loadData,
		fetchColumns,
		fetchTasks,
		addColumn,
		addTask,
		editColumn,
		editTask,
		moveColumn,
		moveTask,
		deleteColumn,
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
