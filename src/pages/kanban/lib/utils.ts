import { cn } from '@/shared/lib/utils';

export const getDivider = (className?: string) => {
	const divider = document.createElement('div');
	divider.className = cn('border-b w-full border-(--border-color)', className);
	return divider;
};

export const generateId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

// === SVG ===
export const createSvg = (svgText: string, className = ''): SVGSVGElement | undefined => {
	const template = document.createElement('template');
	template.innerHTML = svgText.trim();

	const svg = template.content.firstElementChild;
	if (!(svg instanceof SVGSVGElement)) return;

	if (className) svg.classList.add(...className.split(' ').filter(Boolean));

	return svg;
};

export const insertSvg = (container: HTMLElement, svgText: string, className = ''): SVGSVGElement | undefined => {
	const svg = createSvg(svgText, className);
	if (!svg) return;

	container.append(svg);
	return svg;
};

// === TASK STATUS ===
export type TaskStatusConfig = {
	label: string;
	color: string;
	halo?: boolean;
};

export const TASK_STATUS = {
	active: {
		label: 'В работе',
		color: '--status-success',
		halo: true,
	},

	paused: {
		label: 'На паузе',
		color: '--status-warning',
	},

	waiting: {
		label: 'Ожидание',
		color: '--status-info',
	},
} satisfies Record<string, TaskStatusConfig>;

export type TaskStatus = keyof typeof TASK_STATUS;

// === TASK PRIORITY ===
type TaskPriorityConfig = {
	label: string;
	color: string;
};

export const TASK_PRIORITY = {
	low: {
		label: 'Низкий',
		color: '--status-info',
	},

	medium: {
		label: 'Обычный',
		color: '--status-success',
	},

	high: {
		label: 'Высокий',
		color: '--status-warning',
	},

	urgent: {
		label: 'Срочный',
		color: '--status-error',
	},
} satisfies Record<string, TaskPriorityConfig>;

export type TaskPriority = keyof typeof TASK_PRIORITY;

// === COLUMN COLORS ===
export const COLUMN_COLORS = {
	emerald: '#10b981',
	blue: '#3b82f6',
	violet: '#8b5cf6',
	yellow: '#f3a619',
	rose: '#f43f5e',
	cyan: '#06b6d4',
	lime: '#84cc16',
	fuchsia: '#d946ef',
} as const;

export type ColumnColor = keyof typeof COLUMN_COLORS;
