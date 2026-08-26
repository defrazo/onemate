import { generateUUID } from '@/shared/lib/utils';

import { getDefaultColumns, getDefaultTasks, MESSAGES, now } from '../../lib';
import type {
	Column,
	CreateColumnInput,
	CreateTaskInput,
	EditColumnInput,
	EditTaskInput,
	IKanbanRepo,
	Task,
} from '../../model';

export class KanbanRepoDemo implements IKanbanRepo {
	private columns: Column[];
	private tasks: Task[];

	constructor() {
		this.columns = getDefaultColumns().map((column) => ({ ...column, id: generateUUID() }));

		this.tasks = getDefaultTasks(this.columns.map((column) => column.id)).map((task) => ({
			...task,
			id: generateUUID(),
			createdAt: now(),
			updatedAt: null,
		}));
	}

	async fetchColumns(): Promise<Column[]> {
		return this.columns.map((item) => ({ ...item }));
	}

	async addColumn(column: CreateColumnInput): Promise<Column> {
		const newColumn = { ...column, id: generateUUID() };

		this.columns.push(newColumn);

		return { ...newColumn };
	}

	async editColumn(id: string, column: EditColumnInput): Promise<Column> {
		const index = this.columns.findIndex((item) => item.id === id);
		if (index === -1) throw new Error(MESSAGES.columns.updateError);

		this.columns[index] = { ...this.columns[index], ...column };

		return { ...this.columns[index] };
	}

	async deleteColumn(id: string): Promise<void> {
		this.columns = this.columns.filter((item) => item.id !== id);
	}

	async moveColumn(id: string, position: number): Promise<Column> {
		const column = this.columns.find((item) => item.id === id);
		if (!column) throw new Error(MESSAGES.columns.moveError);

		column.position = position;

		return { ...column };
	}

	async fetchTasks(): Promise<Task[]> {
		return this.tasks.map((item) => ({ ...item }));
	}

	async addTask(task: CreateTaskInput): Promise<Task> {
		const newTask = { ...task, id: generateUUID(), createdAt: now(), updatedAt: null };

		this.tasks.push(newTask);

		return { ...newTask };
	}

	async editTask(id: string, task: EditTaskInput): Promise<Task> {
		const index = this.tasks.findIndex((item) => item.id === id);
		if (index === -1) throw new Error(MESSAGES.tasks.updateError);

		this.tasks[index] = { ...this.tasks[index], ...task };

		return { ...this.tasks[index] };
	}

	async deleteTask(id: string): Promise<void> {
		this.tasks = this.tasks.filter((item) => item.id !== id);
	}

	async moveTask(id: string, columnId: string, position: number, updatedAt: string | null): Promise<Task> {
		const task = this.tasks.find((item) => item.id === id);
		if (!task) throw new Error(MESSAGES.tasks.moveError);

		task.columnId = columnId;
		task.position = position;
		task.updatedAt = updatedAt;

		return { ...task };
	}
}
