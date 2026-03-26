import {
	addColumnApi,
	addTaskApi,
	deleteColumnApi,
	deleteTaskApi,
	editColumnApi,
	editTaskApi,
	fetchColumnsApi,
	fetchTasksApi,
	moveColumnApi,
	moveTaskApi,
} from '../api';
import type { ColumnColor, TaskPriority, TaskStatus } from '../lib';
import { getDefaultColumns, getDefaultTasks, LIMITS, MESSAGES, notifier } from '../lib';
import type { Column, Task } from '.';

const fallback = async <T>(snapshot: T, restore: (snapshot: T) => void, notify: () => void) => {
	restore(snapshot);
	notify();
	notifier.setNotice('Нет связи с сервером. Данные могут быть неактуальны.', 'error');
};

export const createState = () => {
	// === COLUMNS ===
	let columns: Column[] = [];
	let columnListeners: Array<(columns: Column[]) => void> = [];

	const getColumns = () => [...columns];
	const notifyColumns = () => columnListeners.forEach((callback) => callback([...columns]));

	const fetchColumns = async () => {
		try {
			const fetched = await fetchColumnsApi();

			if (!fetched || fetched.length === 0) {
				const added: Column[] = [];

				for (const column of getDefaultColumns()) {
					const newColumn = await addColumnApi({
						title: column.title,
						position: column.position,
						taskLimit: column.taskLimit,
						color: column.color,
					});
					added.push(newColumn);
				}
				columns = added;
			} else columns = fetched;

			notifyColumns();
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.fetchError, 'error');
		}
	};

	const addColumn = async (title: string, taskLimit: number, color: ColumnColor) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			if (columns.length >= LIMITS.MAX_COLUMNS) {
				notifier.setNotice(MESSAGES.columns.addLimit, 'info');
				return;
			}

			const position = columns.length > 0 ? Math.max(...columns.map((column) => column.position)) + 1 : 0;
			const newColumn = await addColumnApi({ title, taskLimit, position, color });

			columns.push(newColumn);
			notifyColumns();
			notifier.setNotice(MESSAGES.columns.added, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.addError, 'error');
			await fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const editColumn = async (id: string, title: string, taskLimit: number, color: ColumnColor) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			columns = columns.map((column) => (column.id === id ? { ...column, title, taskLimit, color } : column));
			notifyColumns();

			await editColumnApi(id, { title, taskLimit, color });
			notifier.setNotice(MESSAGES.columns.updated, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.updateError, 'error');
			await fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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

			await deleteColumnApi(id);
			notifier.setNotice(MESSAGES.columns.deleted, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.deleteError, 'error');
			await fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const moveColumn = async (id: string, newIndex: number) => {
		const snapshot = columns.map((column) => ({ ...column }));

		try {
			const oldIndex = columns.findIndex((column) => column.id === id);
			if (oldIndex === -1 || oldIndex === newIndex) return;

			const updated = [...columns];
			const [moved] = updated.splice(oldIndex, 1);
			updated.splice(newIndex, 0, moved);
			updated.forEach((column, idx) => (column.position = idx));

			columns = updated;
			notifyColumns();

			for (const column of columns) await moveColumnApi(column.id, column.position);

			notifier.setNotice(MESSAGES.columns.moved, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.columns.moveError, 'error');
			await fallback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const subscribeColumns = (callback: (columns: Column[]) => void) => {
		columnListeners.push(callback);
		callback([...columns]);
		return () => (columnListeners = columnListeners.filter((listener) => listener !== callback));
	};

	// === TASKS ===
	let tasks: Task[] = [];
	let taskListeners: Array<(tasks: Task[]) => void> = [];

	const notifyTasks = () => taskListeners.forEach((callback) => callback([...tasks]));

	const fetchTasks = async () => {
		try {
			const fetched = await fetchTasksApi();

			if (!fetched || fetched.length === 0) {
				const added: Task[] = [];
				const defaultTasks = getDefaultTasks(columns.map((column) => column.id));

				for (const task of defaultTasks) {
					if (!task.columnId) continue;
					const newTask = await addTaskApi({
						title: task.title,
						description: task.description,
						status: task.status,
						priority: task.priority,
						columnId: task.columnId,
						position: task.position,
						date: task.date,
						startDate: task.startDate,
						endDate: task.endDate,
					});
					added.push(newTask);
				}
				tasks = added;
			} else tasks = fetched;

			notifyTasks();
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.fetchError, 'error');
		}
	};

	const addTask = async (
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		columnId: string,
		date: string,
		startDate: string,
		endDate: string | null,
		taskLimit: number
	) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			const columnTasks = tasks.filter((task) => task.columnId === columnId);

			if (columnTasks.length + 1 > taskLimit) {
				notifier.setNotice(MESSAGES.tasks.addLimit, 'error');
				return;
			}

			const position = columnTasks.length > 0 ? Math.max(...columnTasks.map((task) => task.position)) + 1 : 0;
			const newTask = await addTaskApi({
				title,
				description,
				status,
				priority,
				columnId,
				position,
				date,
				startDate,
				endDate,
			});

			tasks.push(newTask);
			notifyTasks();
			notifier.setNotice(MESSAGES.tasks.added, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.addError, 'error');
			await fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const editTask = async (
		id: string,
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		date: string,
		startDate: string,
		endDate: string | null
	) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			tasks = tasks.map((task) =>
				task.id === id ? { ...task, title, description, status, priority, date, startDate, endDate } : task
			);
			notifyTasks();

			await editTaskApi(id, { title, description, status, priority, date, startDate, endDate });
			notifier.setNotice(MESSAGES.tasks.updated, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.updateError, 'error');
			await fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const moveTask = async (id: string, newColumnId: string, newIndex: number) => {
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

			const updatedTask = { ...task, columnId: newColumnId, position: newPosition };
			withoutTask.splice(newIndex, 0, updatedTask);

			if (task.columnId === updatedTask.columnId && task.position === updatedTask.position) {
				tasks = withoutTask;
				notifyTasks();
				return;
			}

			tasks = withoutTask;
			notifyTasks();

			await moveTaskApi(id, newColumnId, newPosition);
			notifier.setNotice(MESSAGES.tasks.moved, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.moveError, 'error');
			await fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const deleteTask = async (id: string) => {
		const snapshot = tasks.map((task) => ({ ...task }));

		try {
			tasks = tasks.filter((task) => task.id !== id);
			notifyTasks();

			await deleteTaskApi(id);
			notifier.setNotice(MESSAGES.tasks.deleted, 'success');
		} catch (_error) {
			notifier.setNotice(MESSAGES.tasks.deleteError, 'error');
			await fallback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const subscribeTasks = (callback: (tasks: Task[]) => void) => {
		taskListeners.push(callback);
		callback([...tasks]);

		return () => (taskListeners = taskListeners.filter((listener) => listener !== callback));
	};

	const init = async () => {
		await fetchColumns();
		await fetchTasks();
	};

	return {
		init,
		fetchTasks,
		fetchColumns,
		addTask,
		addColumn,
		editTask,
		editColumn,
		moveTask,
		moveColumn,
		deleteTask,
		deleteColumn,
		getColumns,
		subscribeTasks,
		subscribeColumns,
	};
};
