import type { TaskPriority, TaskStatus } from '../lib';
import type { Column, DbColumn, DbTask, Task } from '../model';

// === TASKS ===
export const mapTaskFromDb = (db: DbTask): Task => ({
	id: db.id,
	title: db.title,
	description: db.description,
	status: db.status as TaskStatus,
	priority: db.priority as TaskPriority,
	col: db.col,
	position: db.position,
	date: db.date,
	startDate: db.start_date,
	endDate: db.end_date ?? null,
});

export const mapTaskToDb = (task: Omit<Task, 'id'>): Partial<DbTask> => ({
	title: task.title,
	description: task.description,
	status: task.status,
	priority: task.priority,
	col: task.col,
	position: task.position,
	date: task.date,
	start_date: task.startDate,
	end_date: task.endDate,
});

export const mapTaskUpdateToDb = (task: Omit<Task, 'id' | 'col' | 'position'>): Partial<DbTask> => ({
	title: task.title,
	description: task.description,
	date: task.date,
	status: task.status,
	priority: task.priority,
	start_date: task.startDate,
	end_date: task.endDate,
});

// === COLUMNS ===
export const mapColumnFromDb = (db: DbColumn): Column => ({
	id: db.id,
	title: db.title,
	position: db.position,
	taskLimit: db.task_limit,
	color: db.color,
});

export const mapColumnToDb = (column: Omit<Column, 'id'>): Partial<DbColumn> => ({
	title: column.title,
	position: column.position,
	task_limit: column.taskLimit,
	color: column.color,
});

export const mapColumnUpdateToDb = (column: Omit<Column, 'id' | 'position'>): Partial<DbColumn> => ({
	title: column.title,
	task_limit: column.taskLimit,
	color: column.color,
});
