import { generateUUID } from '@/shared/lib/utils';

import { getDefaultColumns, getDefaultTasks, MESSAGES, now } from '../../lib';
import type { Column, CreateColumnInput, CreateTaskInput, EditColumnInput, EditTaskInput, Task } from '../../model';
import type { IKanbanRepo } from '.';

export class KanbanRepoDemo implements IKanbanRepo {
	private columns: Column[];
	private tasks: Task[];

	private getID = () => generateUUID();

	constructor(initColumns: Column[] = [], initTasks: Task[] = []) {
		this.columns = initColumns.length
			? initColumns.map((column) => ({ ...column }))
			: getDefaultColumns().map((column) => ({ ...column, id: this.getID() }));

		this.tasks = initTasks.length
			? initTasks.map((task) => ({ ...task }))
			: getDefaultTasks(this.columns.map((column) => column.id)).map((task) => ({
					...task,
					id: this.getID(),
					createdAt: now(),
					updatedAt: null,
				}));
	}

	// === COLUMNS ===
	async fetchColumns(): Promise<Column[]> {
		return this.columns.map((column) => ({ ...column }));
	}

	async addColumn(column: CreateColumnInput): Promise<Column> {
		const newColumn: Column = { ...column, id: this.getID() };
		this.columns.push(newColumn);
		return newColumn;
	}

	async editColumn(id: string, column: EditColumnInput): Promise<Column> {
		const idx = this.columns.findIndex((column) => column.id === id);
		if (idx === -1) throw new Error(MESSAGES.columns.updateError);

		this.columns[idx] = { ...this.columns[idx], ...column };
		return this.columns[idx];
	}

	async deleteColumn(id: string): Promise<void> {
		this.columns = this.columns.filter((column) => column.id !== id);
	}

	async moveColumn(id: string, newPosition: number): Promise<Column> {
		const column = this.columns.find((column) => column.id === id);
		if (!column) throw new Error(MESSAGES.columns.moveError);

		column.position = newPosition;
		return column;
	}

	// === TASKS ===
	async fetchTasks(): Promise<Task[]> {
		return this.tasks.map((task) => ({ ...task }));
	}

	async addTask(task: CreateTaskInput): Promise<Task> {
		const newTask: Task = { ...task, id: this.getID(), createdAt: now(), updatedAt: null };
		this.tasks.push(newTask);
		return newTask;
	}

	async editTask(id: string, task: EditTaskInput): Promise<Task> {
		const idx = this.tasks.findIndex((task) => task.id === id);
		if (idx === -1) throw new Error(MESSAGES.tasks.updateError);

		this.tasks[idx] = { ...this.tasks[idx], ...task };
		return this.tasks[idx];
	}

	async deleteTask(id: string): Promise<void> {
		this.tasks = this.tasks.filter((task) => task.id !== id);
	}

	async moveTask(id: string, columnId: string, position: number, updatedAt: string): Promise<Task> {
		const task = this.tasks.find((task) => task.id === id);
		if (!task) throw new Error(MESSAGES.tasks.moveError);

		task.columnId = columnId;
		task.position = position;
		task.updatedAt = updatedAt;

		return task;
	}
}
