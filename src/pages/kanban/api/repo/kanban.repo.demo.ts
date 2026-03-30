import { generateUUID } from '@/shared/lib/utils';

import { getDefaultColumns, getDefaultTasks, MESSAGES } from '../../lib';
import type { Column, Task } from '../../model';
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
				}));
	}

	// === COLUMNS ===
	async fetchColumns(): Promise<Column[]> {
		return this.columns.map((column) => ({ ...column }));
	}

	async addColumn(column: Omit<Column, 'id'>): Promise<Column> {
		const newColumn: Column = { ...column, id: this.getID() };
		this.columns.push(newColumn);
		return newColumn;
	}

	async editColumn(id: string, column: Omit<Column, 'id' | 'position'>): Promise<Column> {
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

	async addTask(task: Omit<Task, 'id'>): Promise<Task> {
		const newTask: Task = { ...task, id: this.getID() };
		this.tasks.push(newTask);
		return newTask;
	}

	async editTask(id: string, task: Omit<Task, 'id' | 'columnId' | 'position'>): Promise<Task> {
		const idx = this.tasks.findIndex((task) => task.id === id);
		if (idx === -1) throw new Error(MESSAGES.tasks.updateError);

		this.tasks[idx] = { ...this.tasks[idx], ...task };
		return this.tasks[idx];
	}

	async deleteTask(id: string): Promise<void> {
		this.tasks = this.tasks.filter((task) => task.id !== id);
	}

	async moveTask(id: string, columnId: string, position: number): Promise<Task> {
		const task = this.tasks.find((task) => task.id === id);
		if (!task) throw new Error(MESSAGES.tasks.moveError);

		task.columnId = columnId;
		task.position = position;

		return task;
	}
}
