import type { Task } from '.';

export const createState = () => {
	let columns: string[] = ['Запланировано', 'Подготовка', 'В работе', 'Завершено'];

	let tasks: Task[] = [
		{ id: '1', title: 'Task 1', column: 'Запланировано', date: '07.10.2026' },
		{ id: '2', title: 'Task 2', column: 'Подготовка', date: '07.10.2026' },
		{ id: '3', title: 'Task 3', column: 'В работе', date: '07.10.2026' },
		{ id: '4', title: 'Task 4', column: 'В работе', date: '07.10.2026' },
		{ id: '5', title: 'Task 5', column: 'Завершено', date: '07.10.2026' },
	];

	let listeners: Array<(tasks: Task[]) => void> = [];

	const notify = () => {
		listeners.forEach((callback) => callback(tasks));
	};

	const addTask = (title: string, column: string, date: string) => {
		const newTask: Task = { id: crypto.randomUUID(), title, column, date };

		tasks = [...tasks, newTask];
		notify();
	};

	const moveTask = (taskId: string, newColumn: string) => {
		tasks = tasks.map((currentTask) =>
			currentTask.id === taskId ? { ...currentTask, column: newColumn } : currentTask
		);
		notify();
	};

	const subscribe = (callback: (tasks: Task[]) => void) => {
		listeners.push(callback);
		callback(tasks);

		return () => {
			listeners = listeners.filter((l) => l !== callback);
		};
	};

	return { addTask, moveTask, subscribe, getColumns: () => columns, getTasks: () => tasks };
};
