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
import { type ColumnColor, notifier, type TaskPriority, type TaskStatus } from '../lib';
import type { Column, Task } from '.';

const defaultColumns: Column[] = [
	{ id: crypto.randomUUID(), title: 'Запланировано', position: 0, taskLimit: 10, color: 'slate' },
	{ id: crypto.randomUUID(), title: 'Подготовка', position: 1, taskLimit: 10, color: 'amber' },
	{ id: crypto.randomUUID(), title: 'В работе', position: 2, taskLimit: 10, color: 'rose' },
	{ id: crypto.randomUUID(), title: 'Завершено', position: 3, taskLimit: 10, color: 'lime' },
];

const fallback = async <T>(
	fetch: () => Promise<void>,
	snapshot: T,
	restore: (snapshot: T) => void,
	notify: () => void
) => {
	try {
		await fetch();
	} catch {
		restore(snapshot);
		notify();
		notifier.setNotice('Нет связи с сервером. Данные могут быть неактуальны.', 'error');
	}
};

export const createState = () => {
	// === COLUMNS ===
	let columns: Column[] = [...defaultColumns];
	let columnListeners: Array<(columns: Column[]) => void> = [];

	const getColumns = () => [...columns];
	const notifyColumns = () => columnListeners.forEach((callback) => callback([...columns]));

	const fetchColumns = async () => {
		try {
			const fetched = await fetchColumnsApi();

			if (!fetched || fetched.length === 0) {
				const added: Column[] = [];

				for (const column of defaultColumns) {
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
			notifier.setNotice('Произошла ошибка при загрузке колонок', 'error');
		}
	};

	const addColumn = async (title: string, taskLimit: number, color: ColumnColor) => {
		const snapshot = [...columns];

		try {
			const position = columns.length > 0 ? Math.max(...columns.map((column) => column.position)) + 1 : 0;
			const newColumn = await addColumnApi({ title, taskLimit, position, color });

			columns.push(newColumn);
			notifyColumns();
			notifier.setNotice('Колонка добавлена!', 'success');

			return newColumn;
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при добавлении колонки', 'error');
			await fallback(fetchColumns, snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const editColumn = async (id: string, title: string, taskLimit: number, color: ColumnColor) => {
		const snapshot = [...columns];

		try {
			columns = columns.map((column) => (column.id === id ? { ...column, title, taskLimit, color } : column));
			notifyColumns();

			await editColumnApi(id, { title, taskLimit, color });
			notifier.setNotice('Колонка обновлена!', 'success');
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при обновлении колонки', 'error');
			await fallback(fetchColumns, snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const deleteColumn = async (id: string) => {
		const snapshot = [...columns];

		try {
			columns = columns.filter((column) => column.id !== id);
			notifyColumns();

			await deleteColumnApi(id);
			notifier.setNotice('Колонка удалена!', 'success');
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при удалении колонки', 'error');
			await fallback(fetchColumns, snapshot, (snapshot) => (columns = snapshot), notifyColumns);
		}
	};

	const moveColumn = async (id: string, newIndex: number) => {
		const snapshot = [...columns];

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

			notifier.setNotice('Колонки обновлены!', 'success');
		} catch (_error) {
			notifier.setNotice('Ошибка при перемещении колонки', 'error');
			await fallback(fetchColumns, snapshot, (snapshot) => (columns = snapshot), notifyColumns);
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
			tasks = (await fetchTasksApi()) ?? [];
			notifyTasks();
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при загрузке задач', 'error');
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
		endDate: string | null
	) => {
		const snapshot = [...tasks];

		try {
			const columnTasks = tasks.filter((task) => task.columnId === columnId);
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
			notifier.setNotice('Задача добавлена!', 'success');
			return newTask;
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при добавлении задачи', 'error');
			await fallback(fetchTasks, snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
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
		const snapshot = [...tasks];

		try {
			tasks = tasks.map((task) =>
				task.id === id ? { ...task, title, description, status, priority, date, startDate, endDate } : task
			);
			notifyTasks();

			await editTaskApi(id, { title, description, status, priority, date, startDate, endDate });
			notifier.setNotice('Задача обновлена!', 'success');
		} catch (_error) {
			notifier.setNotice('Произошла ошибка при редактировании задачи', 'error');
			await fallback(fetchTasks, snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const deleteTask = async (id: string) => {
		const snapshot = [...tasks];

		try {
			tasks = tasks.filter((task) => task.id !== id);
			notifyTasks();

			await deleteTaskApi(id);
			notifier.setNotice('Задача удалена!', 'success');
		} catch (_error) {
			notifier.setNotice('Ошибка при удалении', 'error');
			await fallback(fetchTasks, snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
		}
	};

	const moveTask = async (id: string, newColumnId: string, newIndex: number) => {
		const snapshot = [...tasks];

		try {
			const task = tasks.find((task) => task.id === id);
			if (!task) return;

			const oldIndex = tasks.findIndex((task) => task.id === id);
			const withoutTask = [...tasks];
			withoutTask.splice(oldIndex, 1);

			const columnTasks = withoutTask.filter((task) => task.columnId === newColumnId);

			let newPosition: number;
			if (columnTasks.length === 0) newPosition = 1000;
			else if (newIndex === 0) newPosition = columnTasks[0].position - 1000;
			else if (newIndex >= columnTasks.length) newPosition = columnTasks[columnTasks.length - 1].position + 1000;
			else newPosition = (columnTasks[newIndex - 1].position + columnTasks[newIndex].position) / 2;

			const updatedTask = { ...task, columnId: newColumnId, position: newPosition };

			withoutTask.splice(newIndex, 0, updatedTask);
			tasks = withoutTask;
			notifyTasks();

			await moveTaskApi(id, newColumnId, newPosition);
			notifier.setNotice('Задача перемещена!', 'success');
		} catch (_error) {
			notifier.setNotice('Ошибка при перемещении задачи', 'error');
			await fallback(fetchTasks, snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
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
		addTask,
		addColumn,
		editTask,
		editColumn,
		deleteTask,
		deleteColumn,
		moveTask,
		moveColumn,
		fetchTasks,
		fetchColumns,
		getColumns,
		subscribeTasks,
		subscribeColumns,
	};
};
