import type { Task, TaskPriority, TaskStatus } from '.';

const STATUS_ORDER: Record<TaskStatus, number> = { active: 0, paused: 1, waiting: 2 };
const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export const sortTasks = (a: Task, b: Task) => {
	if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);

	const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
	if (statusDiff !== 0) return statusDiff;

	const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
	if (priorityDiff !== 0) return priorityDiff;

	return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
};
