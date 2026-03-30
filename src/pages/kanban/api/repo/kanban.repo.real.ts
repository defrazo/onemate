import type { Column, Task } from '../../model';
import { addColumnApi, deleteColumnApi, editColumnApi, fetchColumnsApi, moveColumnApi } from '..';
import { addTaskApi, deleteTaskApi, editTaskApi, fetchTasksApi, moveTaskApi } from '..';
import type { IKanbanRepo } from '.';

export class KanbanRepoReal implements IKanbanRepo {
	// === COLUMNS ===
	async fetchColumns(): Promise<Column[]> {
		return fetchColumnsApi();
	}

	async addColumn(column: Omit<Column, 'id'>): Promise<Column> {
		return addColumnApi(column);
	}

	async editColumn(id: string, column: Omit<Column, 'id' | 'position'>): Promise<Column> {
		return editColumnApi(id, column);
	}

	async moveColumn(id: string, newPosition: number): Promise<Column> {
		return moveColumnApi(id, newPosition);
	}

	async deleteColumn(id: string): Promise<void> {
		return deleteColumnApi(id);
	}

	// === TASKS ===
	async fetchTasks(): Promise<Task[]> {
		return fetchTasksApi();
	}

	async addTask(task: Omit<Task, 'id'>): Promise<Task> {
		return addTaskApi(task);
	}

	async editTask(id: string, task: Omit<Task, 'id' | 'columnId' | 'position'>): Promise<Task> {
		return editTaskApi(id, task);
	}

	async moveTask(id: string, columnId: string, position: number): Promise<Task> {
		return moveTaskApi(id, columnId, position);
	}

	async deleteTask(id: string): Promise<void> {
		return deleteTaskApi(id);
	}
}
