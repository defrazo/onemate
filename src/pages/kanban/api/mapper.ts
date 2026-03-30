import type { TaskPriority, TaskStatus } from '../lib';
import type { Column, DbColumn, DbTask, Task } from '../model';

// === COLUMNS ===
export const mapColumnFromDb = (db: DbColumn): Column => ({
	id: db.id,
	title: db.title,
	color: db.color,
	taskLimit: db.task_limit,
	position: db.position,
});

export const mapColumnToDb = (column: Omit<Column, 'id'>): Partial<DbColumn> => ({
	title: column.title,
	color: column.color,
	task_limit: column.taskLimit,
	position: column.position,
});

export const mapColumnUpdateToDb = (column: Omit<Column, 'id' | 'position'>): Partial<DbColumn> => ({
	title: column.title,
	color: column.color,
	task_limit: column.taskLimit,
});

// === TASKS ===
export const mapTaskFromDb = (db: DbTask): Task => ({
	id: db.id,
	columnId: db.column_id,
	title: db.title,
	description: db.description,
	status: db.status as TaskStatus,
	priority: db.priority as TaskPriority,
	position: db.position,
	startDate: db.start_date,
	endDate: db.end_date ?? null,
	completed: db.completed,
	createdAt: db.created_at,
});

export const mapTaskToDb = (task: Omit<Task, 'id'>): Partial<DbTask> => ({
	column_id: task.columnId,
	title: task.title,
	description: task.description,
	status: task.status,
	priority: task.priority,
	position: task.position,
	start_date: task.startDate,
	end_date: task.endDate,
	completed: task.completed,
	created_at: task.createdAt,
});

export const mapTaskUpdateToDb = (task: Omit<Task, 'id' | 'columnId' | 'position'>): Partial<DbTask> => ({
	title: task.title,
	description: task.description,
	status: task.status,
	priority: task.priority,
	start_date: task.startDate,
	end_date: task.endDate,
	completed: task.completed,
	created_at: task.createdAt,
});
