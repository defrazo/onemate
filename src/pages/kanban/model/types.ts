import type { ColumnColor, TaskPriority, TaskStatus } from '../lib';

export type Task = {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	col: string;
	position: number;
	date: string;
	startDate: string;
	endDate: string | null;
};

export type DbTask = {
	id: string;
	user_id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	col: string;
	position: number;
	date: string;
	start_date: string;
	end_date: string | null;
	created_at: string;
};

export type Column = {
	id: string;
	title: string;
	position: number;
	taskLimit: number;
	color: ColumnColor;
};

export type DbColumn = {
	id: string;
	user_id: string;
	title: string;
	position: number;
	task_limit: number;
	color: ColumnColor;
};
