import { api } from '@/shared/api';

import type {
	CreateColumnInput,
	CreateTaskInput,
	DbKanbanBoards,
	DbKanbanSnapshot,
	DeletedKanbanBoard,
	IKanbanRepo,
	KanbanBoards,
	KanbanSnapshot,
} from '../../model';
import { mapBoardFromDb, mapColumnToDb, mapSnapshotFromDb, mapTaskToDb, rethrowKanbanError } from '..';

export class KanbanRepoLaravel implements IKanbanRepo {
	async fetchBoards(): Promise<KanbanBoards> {
		const { data } = await api.get<DbKanbanBoards>('/kanban/boards');
		return { boards: data.boards.map(mapBoardFromDb) };
	}

	initialize(): Promise<KanbanSnapshot> {
		return this.snapshot(api.post('/kanban/boards/initialize'));
	}

	fetchBoard(boardId: string): Promise<KanbanSnapshot> {
		return this.snapshot(api.get(`/kanban/boards/${boardId}`));
	}

	createBoard(title: string): Promise<KanbanSnapshot> {
		return this.snapshot(api.post('/kanban/boards', { title }));
	}

	renameBoard(boardId: string, revision: number, title: string): Promise<KanbanSnapshot> {
		return this.snapshot(api.patch(`/kanban/boards/${boardId}`, { title, revision }));
	}

	async deleteBoard(boardId: string, revision: number): Promise<DeletedKanbanBoard> {
		try {
			const { data } = await api.delete<DeletedKanbanBoard>(`/kanban/boards/${boardId}`, { data: { revision } });
			return data;
		} catch (error: unknown) {
			return rethrowKanbanError(error);
		}
	}

	addColumn(boardId: string, revision: number, column: CreateColumnInput): Promise<KanbanSnapshot> {
		return this.snapshot(api.post(`/kanban/boards/${boardId}/columns`, { ...mapColumnToDb(column), revision }));
	}

	editColumn(
		boardId: string,
		revision: number,
		id: string,
		column: Partial<CreateColumnInput>
	): Promise<KanbanSnapshot> {
		return this.snapshot(
			api.patch(`/kanban/boards/${boardId}/columns/${id}`, { ...mapColumnToDb(column), revision })
		);
	}

	deleteColumn(boardId: string, revision: number, id: string): Promise<KanbanSnapshot> {
		return this.snapshot(api.delete(`/kanban/boards/${boardId}/columns/${id}`, { data: { revision } }));
	}

	reorderColumns(boardId: string, revision: number, columnIds: string[]): Promise<KanbanSnapshot> {
		return this.snapshot(api.patch(`/kanban/boards/${boardId}/columns/order`, { column_ids: columnIds, revision }));
	}

	addTask(boardId: string, revision: number, task: CreateTaskInput): Promise<KanbanSnapshot> {
		return this.snapshot(api.post(`/kanban/boards/${boardId}/tasks`, { ...mapTaskToDb(task), revision }));
	}

	editTask(boardId: string, revision: number, id: string, task: Partial<CreateTaskInput>): Promise<KanbanSnapshot> {
		return this.snapshot(api.patch(`/kanban/boards/${boardId}/tasks/${id}`, { ...mapTaskToDb(task), revision }));
	}

	deleteTask(boardId: string, revision: number, id: string): Promise<KanbanSnapshot> {
		return this.snapshot(api.delete(`/kanban/boards/${boardId}/tasks/${id}`, { data: { revision } }));
	}

	moveTask(
		boardId: string,
		revision: number,
		id: string,
		columnId: string,
		position: number
	): Promise<KanbanSnapshot> {
		return this.snapshot(
			api.patch(`/kanban/boards/${boardId}/tasks/${id}/move`, { column_id: columnId, position, revision })
		);
	}

	private async snapshot(request: Promise<{ data: DbKanbanSnapshot }>): Promise<KanbanSnapshot> {
		try {
			return mapSnapshotFromDb((await request).data);
		} catch (error: unknown) {
			return rethrowKanbanError(error);
		}
	}
}
