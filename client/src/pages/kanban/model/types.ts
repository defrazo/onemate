import { COLUMN_COLORS, TASK_PRIORITY, TASK_STATUS } from '.';

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
	updatedAt: string | null;
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
	updated_at: string | null;
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

export type TaskStatusConfig = {
	label: string;
	color: string;
	halo?: boolean;
};

export type ColumnColor = keyof typeof COLUMN_COLORS;

export type TaskPriority = keyof typeof TASK_PRIORITY;

export type TaskStatus = keyof typeof TASK_STATUS;
