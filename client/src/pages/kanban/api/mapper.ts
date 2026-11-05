import type {
	Column,
	DbColumn,
	DbKanbanBoard,
	DbKanbanSnapshot,
	DbTask,
	KanbanBoard,
	KanbanSnapshot,
	Task,
} from '../model';

// === COLUMNS ===
export const mapColumnFromDb = (db: DbColumn): Column => ({
	id: db.id,
	title: db.title,
	color: db.color,
	taskLimit: db.task_limit,
	position: db.position,
});

export const mapColumnToDb = (column: Partial<Column>): Partial<DbColumn> => {
	const map: Partial<DbColumn> = {};

	if (column.title !== undefined) map.title = column.title;
	if (column.color !== undefined) map.color = column.color;
	if (column.taskLimit !== undefined) map.task_limit = column.taskLimit;
	if (column.position !== undefined) map.position = column.position;

	return map;
};

// === TASKS ===
export const mapTaskFromDb = (db: DbTask): Task => ({
	id: db.id,
	columnId: db.column_id,
	title: db.title,
	description: db.description,
	status: db.status,
	priority: db.priority,
	position: db.position,
	startDate: db.start_date,
	endDate: db.end_date,
	remindBeforeDays: db.remind_before_days ?? null,
	completed: db.completed,
	createdAt: db.created_at,
	updatedAt: db.updated_at ?? null,
});

export const mapTaskToDb = (task: Partial<Task>): Partial<DbTask> => {
	const map: Partial<DbTask> = {};

	if (task.columnId !== undefined) map.column_id = task.columnId;
	if (task.title !== undefined) map.title = task.title;
	if (task.description !== undefined) map.description = task.description;
	if (task.status !== undefined) map.status = task.status;
	if (task.priority !== undefined) map.priority = task.priority;
	if (task.position !== undefined) map.position = task.position;
	if (task.startDate !== undefined) map.start_date = task.startDate;
	if (task.endDate !== undefined) map.end_date = task.endDate;
	if (task.remindBeforeDays !== undefined) map.remind_before_days = task.remindBeforeDays;
	if (task.completed !== undefined) map.completed = task.completed;
	if (task.updatedAt !== undefined) map.updated_at = task.updatedAt;

	return map;
};

export const mapBoardFromDb = (db: DbKanbanBoard): KanbanBoard => ({
	id: db.id,
	ownerId: db.owner_id,
	title: db.title,
	revision: db.revision,
	createdAt: db.created_at,
	updatedAt: db.updated_at,
});

export const mapSnapshotFromDb = (db: DbKanbanSnapshot): KanbanSnapshot => ({
	board: mapBoardFromDb(db.board),
	columns: db.columns.map(mapColumnFromDb),
	tasks: db.tasks.map(mapTaskFromDb),
});
