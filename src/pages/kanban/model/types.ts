import type { ColumnColor, TaskPriority, TaskStatus } from '../lib';

export type Task = {
	id: string;
	columnId: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
	completed: boolean;
	position: number;
	createdAt: string;
};

export type DbTask = {
	id: string;
	user_id: string;
	column_id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	start_date: string;
	end_date: string | null;
	completed: boolean;
	position: number;
	created_at: string;
};

export type Column = {
	id: string;
	title: string;
	color: ColumnColor;
	taskLimit: number;
	position: number;
};

export type DbColumn = {
	id: string;
	user_id: string;
	title: string;
	color: ColumnColor;
	task_limit: number;
	position: number;
};
