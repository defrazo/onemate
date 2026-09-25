import type { TaskStatusConfig } from '.';

export const LIMITS = {
	MIN_COLUMNS: 3,
	MAX_COLUMNS: 6,
	COLUMN_TITLE: 20,
	TASK_TITLE: 60,
	TASK_DESC: 300,
} as const;

export const TASK_STATUS = {
	active: { label: 'В работе', color: '--priority-medium', halo: true },
	paused: { label: 'На паузе', color: '--priority-high' },
	waiting: { label: 'Ожидание', color: '--priority-low' },
} satisfies Record<string, TaskStatusConfig>;

export const TASK_PRIORITY = {
	low: { label: 'Низкий', color: '--priority-low' },
	medium: { label: 'Обычный', color: '--priority-medium' },
	high: { label: 'Высокий', color: '--priority-high' },
} satisfies Record<string, { label: string; color: string }>;

export const COLUMN_COLORS = {
	slate: 'var(--color-slate)',
	rose: 'var(--color-rose)',
	amber: 'var(--color-amber)',
	emerald: 'var(--color-emerald)',
	violet: 'var(--color-violet)',
	lime: 'var(--color-lime)',
	fuchsia: 'var(--color-fuchsia)',
	sky: 'var(--color-sky)',
} as const;
