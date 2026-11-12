import type { COLUMN_COLORS, TASK_PRIORITY, TASK_STATUS } from './constants';

export type Task = {
	id: string;
	columnId: string;
	title: string;
	description: string;
	status: TaskStatus | null;
	priority: TaskPriority | null;
	startDate: string | null;
	endDate: string | null;
	remindBeforeDays: number | null;
	completed: boolean;
	position: number;
	createdAt: string;
	updatedAt: string | null;
};

export type DbTask = {
	id: string;
	user_id: string;
	column_id: string;
	title: string;
	description: string;
	status: TaskStatus | null;
	priority: TaskPriority | null;
	start_date: string | null;
	end_date: string | null;
	remind_before_days: number | null;
	completed: boolean;
	position: number;
	created_at: string;
	updated_at: string | null;
};

export type Column = {
	id: string;
	title: string;
	color: ColumnColor;
	taskLimit: number | null;
	position: number;
};

export type DbColumn = {
	id: string;
	user_id: string;
	title: string;
	color: ColumnColor;
	task_limit: number | null;
	position: number;
};

export type { TaskStatusConfig } from './constants';

export type ColumnColor = keyof typeof COLUMN_COLORS;

export type TaskPriority = keyof typeof TASK_PRIORITY;

export type TaskStatus = keyof typeof TASK_STATUS;

export type CreateColumnInput = Omit<Column, 'id'>;

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export type KanbanBoard = {
	id: string;
	ownerId: string;
	title: string;
	revision: number;
	createdAt: string | null;
	updatedAt: string | null;
};

export type DbKanbanBoard = {
	id: string;
	owner_id: string;
	title: string;
	revision: number;
	created_at: string | null;
	updated_at: string | null;
};

export type KanbanBoards = {
	boards: KanbanBoard[];
};

export type DbKanbanBoards = {
	boards: DbKanbanBoard[];
};

export type KanbanSnapshot = {
	board: KanbanBoard;
	columns: Column[];
	tasks: Task[];
};

export type DbKanbanSnapshot = {
	board: DbKanbanBoard;
	columns: DbColumn[];
	tasks: DbTask[];
};

export type DeletedKanbanBoard = {
	deleted_board_id: string;
};
