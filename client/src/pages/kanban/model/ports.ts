import type { Column, CreateColumnInput, CreateTaskInput, EditColumnInput, EditTaskInput, Task } from '.';

export interface IKanbanRepo {
	fetchColumns(): Promise<Column[]>;
	addColumn(column: CreateColumnInput): Promise<Column>;
	editColumn(id: string, column: EditColumnInput): Promise<Column>;
	deleteColumn(id: string): Promise<void>;
	moveColumn(id: string, newPosition: number): Promise<Column>;

	fetchTasks(): Promise<Task[]>;
	addTask(task: CreateTaskInput): Promise<Task>;
	editTask(id: string, task: EditTaskInput): Promise<Task>;
	deleteTask(id: string): Promise<void>;
	moveTask(id: string, columnId: string, position: number, updatedAt: string | null): Promise<Task>;
}
