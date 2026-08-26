import { api } from '@/shared/api';

import type {
	Column,
	CreateColumnInput,
	CreateTaskInput,
	DbColumn,
	DbTask,
	EditColumnInput,
	EditTaskInput,
	IKanbanRepo,
	Task,
} from '../../model';
import { mapColumnFromDb, mapColumnToDb, mapTaskFromDb, mapTaskToDb } from '..';

type ColumnResponse = {
	column: DbColumn;
};

type ColumnsResponse = {
	columns: DbColumn[];
};

type TaskResponse = {
	task: DbTask;
};

type TasksResponse = {
	tasks: DbTask[];
};

export class KanbanRepoLaravel implements IKanbanRepo {
	async fetchColumns(): Promise<Column[]> {
		const { data } = await api.get<ColumnsResponse>('/kanban/columns');
		return data.columns.map(mapColumnFromDb);
	}

	async addColumn(column: CreateColumnInput): Promise<Column> {
		const { data } = await api.post<ColumnResponse>('/kanban/columns', mapColumnToDb(column));
		return mapColumnFromDb(data.column);
	}

	async editColumn(id: string, column: EditColumnInput): Promise<Column> {
		const { data } = await api.patch<ColumnResponse>(`/kanban/columns/${id}`, mapColumnToDb(column));
		return mapColumnFromDb(data.column);
	}

	async deleteColumn(id: string): Promise<void> {
		await api.delete(`/kanban/columns/${id}`);
	}

	async moveColumn(id: string, newPosition: number): Promise<Column> {
		const { data } = await api.patch<ColumnResponse>(`/kanban/columns/${id}/position`, {
			position: newPosition,
		});
		return mapColumnFromDb(data.column);
	}

	async fetchTasks(): Promise<Task[]> {
		const { data } = await api.get<TasksResponse>('/kanban/tasks');
		return data.tasks.map(mapTaskFromDb);
	}

	async addTask(task: CreateTaskInput): Promise<Task> {
		const { data } = await api.post<TaskResponse>('/kanban/tasks', mapTaskToDb(task));
		return mapTaskFromDb(data.task);
	}

	async editTask(id: string, task: EditTaskInput): Promise<Task> {
		const { data } = await api.patch<TaskResponse>(`/kanban/tasks/${id}`, mapTaskToDb(task));
		return mapTaskFromDb(data.task);
	}

	async deleteTask(id: string): Promise<void> {
		await api.delete(`/kanban/tasks/${id}`);
	}

	async moveTask(id: string, columnId: string, position: number, updatedAt: string | null): Promise<Task> {
		const { data } = await api.patch<TaskResponse>(
			`/kanban/tasks/${id}/position`,
			mapTaskToDb({ columnId, position, updatedAt })
		);
		return mapTaskFromDb(data.task);
	}
}
