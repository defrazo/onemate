import type { Column, Task } from '../../model';
import { KanbanRepoDemo, KanbanRepoReal } from '.';

export type Role = 'user' | 'demo';

export interface IKanbanRepo {
	// === Columns ===
	fetchColumns(): Promise<Column[]>;
	addColumn(column: Omit<Column, 'id'>): Promise<Column>;
	editColumn(id: string, column: Omit<Column, 'id' | 'position'>): Promise<Column>;
	deleteColumn(id: string): Promise<void>;
	moveColumn(id: string, newPosition: number): Promise<Column>;

	// === Tasks ===
	fetchTasks(): Promise<Task[]>;
	addTask(task: Omit<Task, 'id'>): Promise<Task>;
	editTask(id: string, task: Omit<Task, 'id' | 'columnId' | 'position'>): Promise<Task>;
	deleteTask(id: string): Promise<void>;
	moveTask(id: string, columnId: string, position: number): Promise<Task>;
}

export const createKanbanRepo = (role: Role): IKanbanRepo => {
	return role === 'demo' ? new KanbanRepoDemo() : new KanbanRepoReal();
};
