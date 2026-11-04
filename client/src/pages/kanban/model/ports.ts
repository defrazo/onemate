import type { CreateColumnInput, CreateTaskInput, DeletedKanbanBoard, KanbanBoards, KanbanSnapshot } from '.';

export interface IKanbanRepo {
	fetchBoards(): Promise<KanbanBoards>;
	initialize(): Promise<KanbanSnapshot>;
	fetchBoard(boardId: string): Promise<KanbanSnapshot>;
	createBoard(title: string): Promise<KanbanSnapshot>;
	renameBoard(boardId: string, revision: number, title: string): Promise<KanbanSnapshot>;
	deleteBoard(boardId: string, revision: number): Promise<DeletedKanbanBoard>;
	addColumn(boardId: string, revision: number, column: CreateColumnInput): Promise<KanbanSnapshot>;
	editColumn(
		boardId: string,
		revision: number,
		id: string,
		column: Partial<CreateColumnInput>
	): Promise<KanbanSnapshot>;
	deleteColumn(boardId: string, revision: number, id: string): Promise<KanbanSnapshot>;
	reorderColumns(boardId: string, revision: number, columnIds: string[]): Promise<KanbanSnapshot>;
	addTask(boardId: string, revision: number, task: CreateTaskInput): Promise<KanbanSnapshot>;
	editTask(boardId: string, revision: number, id: string, task: Partial<CreateTaskInput>): Promise<KanbanSnapshot>;
	deleteTask(boardId: string, revision: number, id: string): Promise<KanbanSnapshot>;
	moveTask(
		boardId: string,
		revision: number,
		id: string,
		columnId: string,
		position: number
	): Promise<KanbanSnapshot>;
}
