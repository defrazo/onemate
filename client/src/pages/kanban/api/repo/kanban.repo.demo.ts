import { generateUUID } from '@/shared/lib/utils';

import { now } from '../../lib';
import type {
	CreateColumnInput,
	CreateTaskInput,
	DeletedKanbanBoard,
	IKanbanRepo,
	KanbanBoards,
	KanbanSnapshot,
} from '../../model';
import { getDefaultColumns, getDefaultTasks, LIMITS } from '../../model';
import { BoardRevisionConflictError } from '..';

export class KanbanRepoDemo implements IKanbanRepo {
	private boards: KanbanSnapshot[] = [];

	constructor() {
		this.createSnapshot('Моя доска');
	}

	async fetchBoards(): Promise<KanbanBoards> {
		return { boards: this.boards.map((snapshot) => structuredClone(snapshot.board)) };
	}

	async initialize(): Promise<KanbanSnapshot> {
		return this.boards.length ? structuredClone(this.boards[0]) : this.createSnapshot('Моя доска', true);
	}

	async fetchBoard(boardId: string): Promise<KanbanSnapshot> {
		return structuredClone(this.findBoard(boardId));
	}

	async createBoard(title: string): Promise<KanbanSnapshot> {
		return this.createSnapshot(title);
	}

	renameBoard(boardId: string, revision: number, title: string): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => (snapshot.board.title = this.validateTitle(title)));
	}

	async deleteBoard(boardId: string, revision: number): Promise<DeletedKanbanBoard> {
		this.checkRevision(this.findBoard(boardId), revision);

		if (this.boards.length <= 1) throw new Error('Нельзя удалить последнюю доску');
		this.boards = this.boards.filter((snapshot) => snapshot.board.id !== boardId);

		return { deleted_board_id: boardId };
	}

	addColumn(boardId: string, revision: number, column: CreateColumnInput): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			if (snapshot.columns.length >= LIMITS.MAX_COLUMNS) throw new Error('Достигнут лимит колонок');
			snapshot.columns.push({ ...column, id: generateUUID() });
		});
	}

	editColumn(
		boardId: string,
		revision: number,
		id: string,
		changes: Partial<CreateColumnInput>
	): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			Object.assign(this.findColumn(snapshot, id), changes);
		});
	}

	deleteColumn(boardId: string, revision: number, id: string): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			this.findColumn(snapshot, id);

			if (snapshot.columns.length <= LIMITS.MIN_COLUMNS)
				throw new Error(`На доске должно оставаться минимум ${LIMITS.MIN_COLUMNS} колонки`);

			snapshot.columns = snapshot.columns.filter((column) => column.id !== id);
			snapshot.tasks = snapshot.tasks.filter((task) => task.columnId !== id);
		});
	}

	reorderColumns(boardId: string, revision: number, columnIds: string[]): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			if (columnIds.length !== snapshot.columns.length || new Set(columnIds).size !== columnIds.length)
				throw new Error('Некорректный порядок колонок');

			columnIds.forEach((id, index) => (this.findColumn(snapshot, id).position = (index + 1) * 1000));
		});
	}

	addTask(boardId: string, revision: number, task: CreateTaskInput): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			this.checkCapacity(snapshot, task.columnId);
			snapshot.tasks.push({ ...task, id: generateUUID(), createdAt: now(), updatedAt: null });
		});
	}

	editTask(
		boardId: string,
		revision: number,
		id: string,
		changes: Partial<CreateTaskInput>
	): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			const task = this.findTask(snapshot, id);

			if (changes.columnId !== undefined && changes.columnId !== task.columnId)
				this.checkCapacity(snapshot, changes.columnId);

			Object.assign(task, changes, { updatedAt: now() });
		});
	}

	deleteTask(boardId: string, revision: number, id: string): Promise<KanbanSnapshot> {
		return this.updateSnapshot(boardId, revision, (snapshot) => {
			this.findTask(snapshot, id);
			snapshot.tasks = snapshot.tasks.filter((task) => task.id !== id);
		});
	}

	moveTask(
		boardId: string,
		revision: number,
		id: string,
		columnId: string,
		position: number
	): Promise<KanbanSnapshot> {
		return this.editTask(boardId, revision, id, { columnId, position });
	}

	private validateTitle(title: string): string {
		const normalized = title.trim();
		if (!normalized || [...normalized].length > LIMITS.BOARD_TITLE)
			throw new Error('Название доски должно содержать от 1 до 30 символов');

		return normalized;
	}

	private createSnapshot(title: string, withDefaults = false): KanbanSnapshot {
		const normalizedTitle = this.validateTitle(title);

		if (this.boards.length >= LIMITS.MAX_BOARDS) throw new Error('Достигнут лимит досок');

		const columns = withDefaults ? getDefaultColumns().map((column) => ({ ...column, id: generateUUID() })) : [];
		const tasks = withDefaults
			? getDefaultTasks(columns.map((column) => column.id)).map((task) => ({
					...task,
					id: generateUUID(),
					createdAt: now(),
					updatedAt: null,
				}))
			: [];

		const snapshot: KanbanSnapshot = {
			board: {
				id: generateUUID(),
				ownerId: 'demo',
				title: normalizedTitle,
				revision: 0,
				createdAt: now(),
				updatedAt: now(),
			},
			columns,
			tasks,
		};

		this.boards.push(snapshot);

		return structuredClone(snapshot);
	}

	private findBoard(boardId: string): KanbanSnapshot {
		const snapshot = this.boards.find((item) => item.board.id === boardId);
		if (!snapshot) throw new Error('Доска не найдена');

		return snapshot;
	}

	private findColumn(snapshot: KanbanSnapshot, columnId: string) {
		const column = snapshot.columns.find((item) => item.id === columnId);
		if (!column) throw new Error('Колонка не найдена');

		return column;
	}

	private findTask(snapshot: KanbanSnapshot, taskId: string) {
		const task = snapshot.tasks.find((item) => item.id === taskId);
		if (!task) throw new Error('Задача не найдена');

		return task;
	}

	private checkRevision(snapshot: KanbanSnapshot, revision: number): void {
		if (snapshot.board.revision !== revision) throw new BoardRevisionConflictError(snapshot.board.revision);
	}

	private checkCapacity(snapshot: KanbanSnapshot, columnId: string): void {
		const column = this.findColumn(snapshot, columnId);

		if (
			column.taskLimit !== null &&
			snapshot.tasks.filter((task) => task.columnId === columnId).length >= column.taskLimit
		) {
			throw new Error('Достигнут лимит задач в колонке');
		}
	}

	private async updateSnapshot(
		boardId: string,
		revision: number,
		operation: (snapshot: KanbanSnapshot) => void
	): Promise<KanbanSnapshot> {
		const current = this.findBoard(boardId);
		this.checkRevision(current, revision);

		const next = structuredClone(current);
		operation(next);

		next.columns.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
		next.tasks = next.columns.flatMap((column) =>
			next.tasks
				.filter((task) => task.columnId === column.id)
				.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
		);

		next.board.revision++;
		next.board.updatedAt = now();

		this.boards[this.boards.indexOf(current)] = next;

		return structuredClone(next);
	}
}
