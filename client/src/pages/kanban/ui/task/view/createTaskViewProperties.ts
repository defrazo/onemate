import { arrowIcon, calendarIcon, insertSvg, priorityIcon, statusIcon } from '../../../lib';
import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../../../model';
import { createPropertyRow } from '../../components';

type CreateTaskViewPropertiesProps = {
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
};

export const createTaskViewProperties = ({ status, priority, startDate, endDate }: CreateTaskViewPropertiesProps) => {
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-lg border border-(--border-primary) bg-(--tone) select-none';

	// === PERIOD ROW ===
	const periodRow = createPropertyRow(calendarIcon, 'Период', false);

	const period = document.createElement('div');
	period.className = 'flex items-center gap-2 text-sm text-(--text-primary)';

	const start = document.createElement('span');
	start.textContent = formatDate(startDate);

	const arrow = document.createElement('span');
	arrow.className = 'flex size-5 items-center justify-center text-(--text-disabled)';
	insertSvg(arrow, arrowIcon, 'size-5');

	const end = document.createElement('span');
	end.textContent = endDate ? formatDate(endDate) : 'Без срока';

	period.append(start, arrow, end);
	periodRow.content.append(period);

	// === STATUS ===
	const statusRow = createPropertyRow(statusIcon, 'Статус', false);

	const statusValue = document.createElement('span');
	statusValue.textContent = TASK_STATUS[status].label;
	statusValue.className = 'text-sm text-(--text-primary)';

	statusRow.content.append(statusValue);

	// === PRIORITY ===
	const priorityRow = createPropertyRow(priorityIcon, 'Приоритет', false);

	const priorityValue = document.createElement('span');
	priorityValue.textContent = TASK_PRIORITY[priority].label;
	priorityValue.className = 'text-sm font-medium';
	priorityValue.style.color = `var(${TASK_PRIORITY[priority].color})`;

	priorityRow.content.append(priorityValue);

	element.append(periodRow.element, statusRow.element, priorityRow.element);

	return { element };
};

const formatDate = (iso: string): string => {
	const [year, month, day] = iso.split('-');
	return `${day}.${month}.${year}`;
};
