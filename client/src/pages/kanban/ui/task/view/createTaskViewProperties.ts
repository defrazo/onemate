import { arrowIcon, calendarIcon, calendarTimeIcon, insertSvg, priorityIcon, statusIcon } from '../../../lib';
import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../../../model';
import { createPropertyRow } from '../../components';

type CreateTaskViewPropertiesProps = {
	status: TaskStatus | null;
	priority: TaskPriority | null;
	startDate: string | null;
	endDate: string | null;
	remindBeforeDays: number | null;
};

export const createTaskViewProperties = ({
	status,
	priority,
	startDate,
	endDate,
	remindBeforeDays,
}: CreateTaskViewPropertiesProps) => {
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-lg border border-(--border-primary) bg-(--tone) select-none';

	// === PERIOD ROW ===
	const periodRow = createPropertyRow(calendarIcon, 'Период', false);

	const period = document.createElement('div');
	period.className = 'flex items-center gap-2 text-sm text-(--text-primary)';

	const start = document.createElement('span');
	start.textContent = startDate ? formatDate(startDate) : 'Без даты';

	const arrow = document.createElement('span');
	arrow.className = 'flex size-5 items-center justify-center text-(--text-disabled)';
	insertSvg(arrow, arrowIcon, 'size-5');

	const end = document.createElement('span');
	end.textContent = endDate ? formatDate(endDate) : 'Без срока';

	period.append(start, arrow, end);
	periodRow.content.append(period);

	// === REMINDER ===
	const reminderRow = createPropertyRow(calendarTimeIcon, 'Напомнить', false);

	const reminderLabels: Record<number, string> = {
		0: 'В день срока',
		1: 'За 1 день',
		2: 'За 2 дня',
		3: 'За 3 дня',
		7: 'За неделю',
	};

	const reminderValue = document.createElement('span');
	reminderValue.className = 'text-sm text-(--text-primary)';
	reminderValue.textContent = remindBeforeDays !== null ? (reminderLabels[remindBeforeDays] ?? 'Нет') : 'Нет';

	reminderRow.content.append(reminderValue);

	// === STATUS ===
	const statusRow = createPropertyRow(statusIcon, 'Статус', false);

	const statusValue = document.createElement('span');
	statusValue.textContent = status !== null ? TASK_STATUS[status].label : 'Не указан';
	statusValue.className = 'text-sm text-(--text-primary)';

	statusRow.content.append(statusValue);

	// === PRIORITY ===
	const priorityRow = createPropertyRow(priorityIcon, 'Приоритет', false);

	const priorityValue = document.createElement('span');
	priorityValue.textContent = priority !== null ? TASK_PRIORITY[priority].label : 'Не указан';
	priorityValue.className = 'text-sm font-medium';

	if (priority !== null) priorityValue.style.color = `var(${TASK_PRIORITY[priority].color})`;

	priorityRow.content.append(priorityValue);

	// === ASSEMBLY ===
	element.append(periodRow.element, reminderRow.element, statusRow.element, priorityRow.element);

	return { element };
};

const formatDate = (iso: string): string => {
	const [year, month, day] = iso.slice(0, 10).split('-');
	return `${day}.${month}.${year}`;
};
