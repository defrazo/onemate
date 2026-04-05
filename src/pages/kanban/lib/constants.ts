// === NOTIFY MESSAGES ===
export const MESSAGES = {
	columns: {
		fetchError: 'Не удалось загрузить колонки',
		added: 'Колонка добавлена!',
		addError: 'Не удалось добавить колонку',
		addLimit: 'Нельзя добавить колонку – достигнут максимум',
		addTitleLimit: 'Слишком длинный заголовок – колонка не создана',
		updated: 'Колонка обновлена!',
		updateError: 'Не удалось обновить колонку',
		updateTitleLimit: 'Слишком длинный заголовок – колонка не обновлена',
		deleted: 'Колонка удалена!',
		deleteError: 'Не удалось удалить колонку',
		deleteLimit: 'Нельзя удалить колонку – достигнут минимум',
		moved: 'Колонки обновлены!',
		moveError: 'Не удалось переместить колонку',
	},
	tasks: {
		fetchError: 'Не удалось загрузить задачи',
		added: 'Задача добавлена!',
		addError: 'Не удалось добавить задачу',
		addLimit: 'Нельзя добавить задачу – достигнут максимум',
		addTitleLimit: 'Слишком длинный заголовок – задача не создана',
		updated: 'Задача обновлена!',
		updateError: 'Не удалось обновить задачу',
		updateTitleLimit: 'Слишком длинный заголовок – задача не обновлена',
		deleted: 'Задача удалена!',
		deleteError: 'Не удалось удалить задачу',
		moved: 'Задача перемещена!',
		moveError: 'Не удалось переместить задачу',
		moveLimit: 'Нельзя переместить задачу – достигнут максимум',
	},
} as const;

// === KANBAN LIMITS ===
export const LIMITS = {
	MIN_COLUMNS: 3,
	MAX_COLUMNS: 6,
	COLUMN_TITLE: 20,
	TASK_TITLE: 60,
	TASK_DESC: 300,
} as const;

// === TASK STATUS ===
export type TaskStatusConfig = { label: string; color: string; halo?: boolean };

export const TASK_STATUS = {
	active: { label: 'В работе', color: '--priority-medium', halo: true },
	paused: { label: 'На паузе', color: '--priority-high' },
	waiting: { label: 'Ожидание', color: '--priority-low' },
} satisfies Record<string, TaskStatusConfig>;

export type TaskStatus = keyof typeof TASK_STATUS;

// === TASK PRIORITY ===
type TaskPriorityConfig = { label: string; color: string };

export const TASK_PRIORITY = {
	low: { label: 'Низкий', color: '--priority-low' },
	medium: { label: 'Обычный', color: '--priority-medium' },
	high: { label: 'Высокий', color: '--priority-high' },
} satisfies Record<string, TaskPriorityConfig>;

export type TaskPriority = keyof typeof TASK_PRIORITY;

// === COLUMN COLORS ===
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

export type ColumnColor = keyof typeof COLUMN_COLORS;
