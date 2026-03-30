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
	slate: '#64748b',
	rose: '#f43f5e',
	amber: '#fff741',
	emerald: '#10b981',
	violet: '#8b5cf6',
	lime: '#84cc16',
	fuchsia: '#d946ef',
	sky: '#0ea5e9',
} as const;

export type ColumnColor = keyof typeof COLUMN_COLORS;
