import type { Column, CreateColumnInput, CreateTaskInput, EditColumnInput, EditTaskInput, Task } from '../../model';
import { KanbanRepoDemo, KanbanRepoReal } from '.';

export type Role = 'user' | 'demo';

export interface IKanbanRepo {
	// === Columns ===
	fetchColumns(): Promise<Column[]>;
	addColumn(column: CreateColumnInput): Promise<Column>;
	editColumn(id: string, column: EditColumnInput): Promise<Column>;
	deleteColumn(id: string): Promise<void>;
	moveColumn(id: string, newPosition: number): Promise<Column>;

	// === Tasks ===
	fetchTasks(): Promise<Task[]>;
	addTask(task: CreateTaskInput): Promise<Task>;
	editTask(id: string, task: EditTaskInput): Promise<Task>;
	deleteTask(id: string): Promise<void>;
	moveTask(id: string, columnId: string, position: number, updatedAt: string): Promise<Task>;
}

export const createKanbanRepo = (role: Role): IKanbanRepo => {
	return role === 'demo' ? new KanbanRepoDemo() : new KanbanRepoReal();
};
