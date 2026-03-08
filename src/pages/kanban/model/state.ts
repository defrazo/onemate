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
import { type ColumnColor, notifier, TaskPriority, TaskStatus } from '../lib';
import type { Column, Task } from '.';

const defaultColumns: Column[] = [
	{ id: crypto.randomUUID(), title: 'Запланировано', position: 0, taskLimit: 10, color: 'yellow' },
	{ id: crypto.randomUUID(), title: 'Подготовка', position: 1, taskLimit: 10, color: 'yellow' },
	{ id: crypto.randomUUID(), title: 'В работе', position: 2, taskLimit: 10, color: 'yellow' },
	{ id: crypto.randomUUID(), title: 'Завершено', position: 3, taskLimit: 10, color: 'yellow' },
];

export const createState = () => {
	// === COLUMNS ===
	let columns: Column[] = [...defaultColumns];
	let columnListeners: Array<(columns: Column[]) => void> = [];

	const getColumns = () => [...columns];

	const notifyColumns = () => {
		columnListeners.forEach((callback) => callback(columns));
	};

	const fetchColumns = async () => {
		try {
			const fetchedColumns = await fetchColumnsApi();

			if (!fetchedColumns || fetchedColumns.length === 0) {
				const addedColumns: Column[] = [];

				for (const col of defaultColumns) {
					const newCol = await addColumnApi({
						title: col.title,
						position: col.position,
						taskLimit: col.taskLimit,
						color: col.color,
					});

					addedColumns.push(newCol);
				}
				columns = addedColumns;
			} else columns = fetchedColumns;

			notifyColumns();
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при загрузке колонок: ${error}`, 'error');
		}
	};

	const addColumn = async (title: string, taskLimit: number, color: ColumnColor) => {
		try {
			const position = columns.length === 0 ? 0 : Math.max(...columns.map((c) => c.position)) + 1;
			const newColumn = await addColumnApi({ title, taskLimit, position, color });
			await fetchColumns();
			await fetchTasks();

			notifier.setNotice('Колонка добавлена!', 'success');
			return newColumn;
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при добавлении колонки: ${error}`, 'error');
		}
	};

	const editColumn = async (id: string, title: string, taskLimit: number, color: ColumnColor) => {
		try {
			await editColumnApi(id, { title, taskLimit, color });
			await fetchColumns();
			await fetchTasks();

			notifier.setNotice('Колонка обновлена!', 'success');
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при обновлении колонки: ${error}`, 'error');
		}
	};

	const deleteColumn = async (id: string) => {
		try {
			await deleteColumnApi(id);
			await fetchColumns();
			await fetchTasks();

			notifier.setNotice('Колонка удалена!', 'success');
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при удалении колонки: ${error}`, 'error');
		}
	};

	const moveColumn = async (id: string, newIndex: number) => {
		try {
			const updatedColumns = [...columns];
			const oldIndex = updatedColumns.findIndex((c) => c.id === id);
			if (oldIndex === -1 || oldIndex === newIndex) return;

			const [moved] = updatedColumns.splice(oldIndex, 1);
			updatedColumns.splice(newIndex, 0, moved);

			updatedColumns.forEach((col, i) => (col.position = i + 1000));

			for (const col of updatedColumns) {
				await moveColumnApi(col.id, col.position);
			}

			updatedColumns.forEach((col, i) => (col.position = i));

			for (const col of updatedColumns) {
				await moveColumnApi(col.id, col.position);
			}

			notifier.setNotice('Колонки обновлены!', 'success');
		} catch (error) {
			notifier.setNotice(`Ошибка при перемещении колонки: ${error}`, 'error');
		}
	};

	const subscribeColumns = (callback: (columns: Column[]) => void) => {
		columnListeners.push(callback);
		callback([...columns]);

		return () => (columnListeners = columnListeners.filter((l) => l !== callback));
	};

	// === TASKS ===
	let tasks: Task[] = [];
	let taskListeners: Array<(tasks: Task[]) => void> = [];

	const notifyTasks = () => taskListeners.forEach((callback) => callback(tasks));

	const fetchTasks = async () => {
		try {
			tasks = await fetchTasksApi();

			notifyTasks();
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при загрузке задач: ${error}`, 'error');
		}
	};

	const addTask = async (
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		col: string,
		date: string,
		startDate: string,
		endDate: string | null
	) => {
		try {
			const columnTasks = tasks.filter((t) => t.col === col);
			const position = columnTasks.length === 0 ? 1000 : columnTasks[columnTasks.length - 1].position + 1000;
			const newTask = await addTaskApi({
				title,
				description,
				status,
				priority,
				col,
				position,
				date,
				startDate,
				endDate,
			});
			await fetchTasks();

			notifier.setNotice('Задача добавлена!', 'success');
			return newTask;
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при добавлении задачи: ${error}`, 'error');
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
		try {
			await editTaskApi(id, { title, description, status, priority, date, startDate, endDate });
			await fetchTasks();

			notifier.setNotice('Задача обновлена!', 'success');
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при редактировании задачи: ${error}`, 'error');
		}
	};

	const deleteTask = async (id: string) => {
		try {
			await deleteTaskApi(id);
			await fetchTasks();

			notifier.setNotice('Задача удалена!', 'success');
		} catch (error) {
			notifier.setNotice(`Произошла ошибка при удалении задачи: ${error}`, 'error');
		}
	};

	const moveTask = async (id: string, newColumn: string, newIndex: number) => {
		try {
			const task = tasks.find((t) => t.id === id);
			if (!task) return;

			const oldIndex = tasks.findIndex((t) => t.id === id);
			tasks.splice(oldIndex, 1);

			task.col = newColumn;

			const columnTasks = tasks.filter((t) => t.col === newColumn);

			let newPosition: number;

			if (columnTasks.length === 0) {
				newPosition = 1000;
			} else if (newIndex === 0) {
				newPosition = columnTasks[0].position - 1000;
			} else if (newIndex >= columnTasks.length) {
				newPosition = columnTasks[columnTasks.length - 1].position + 1000;
			} else {
				const prev = columnTasks[newIndex - 1];
				const next = columnTasks[newIndex];
				newPosition = (prev.position + next.position) / 2;
			}

			task.position = newPosition;

			tasks.splice(newIndex, 0, task);

			notifyTasks();

			await moveTaskApi(id, newColumn, newPosition);
		} catch (error) {
			notifier.setNotice(`Ошибка при перемещении задачи: ${error}`, 'error');
		}
	};

	const subscribeTasks = (callback: (tasks: Task[]) => void) => {
		taskListeners.push(callback);
		callback([...tasks]);

		return () => (taskListeners = taskListeners.filter((l) => l !== callback));
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
