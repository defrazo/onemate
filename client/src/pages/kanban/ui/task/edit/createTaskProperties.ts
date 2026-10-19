import { arrowIcon, calendarIcon, insertSvg, priorityIcon, statusIcon } from '../../../lib';
import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../../../model';
import { createDatePicker, createPropertyRow, createSelect } from '../../components';

type CreateTaskPropertiesProps = {
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
	onChange: () => void;
};

type TaskPropertiesValue = {
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
};

export const createTaskProperties = ({
	status: initialStatus,
	priority: initialPriority,
	startDate: initialStartDate,
	endDate: initialEndDate,
	onChange,
}: CreateTaskPropertiesProps) => {
	let selectedStatus = initialStatus;
	let selectedPriority = initialPriority;

	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-lg border border-(--border-primary) bg-(--tone) select-none';

	// === PERIOD ===
	const periodRow = createPropertyRow(calendarIcon, 'Период');

	const periodControl = document.createElement('div');
	periodControl.className = 'flex min-w-0 flex-col gap-1.5';

	const datesRow = document.createElement('div');
	datesRow.className = 'flex min-w-0 items-center gap-2';

	const startDate = createDatePicker({ value: initialStartDate, className: 'w-32', onChange: handleDateChange });

	const arrow = document.createElement('div');
	arrow.className = 'flex size-5 shrink-0 items-center justify-center text-(--text-disabled)';
	insertSvg(arrow, arrowIcon, 'size-5');

	const endDate = createDatePicker({ value: initialEndDate, className: 'w-32', onChange: handleDateChange });

	datesRow.append(startDate.element, arrow, endDate.element);

	// === DATE ERROR ===
	const dateError = document.createElement('span');
	dateError.textContent = 'Дата окончания раньше начала';
	dateError.className = 'hidden text-center text-xs text-(--status-error)';

	periodControl.append(datesRow, dateError);
	periodRow.content.append(periodControl);

	// === STATUS ===
	const statusRow = createPropertyRow(statusIcon, 'Статус');

	const statusItems = Object.entries(TASK_STATUS).map(([value, config]) => ({ value, label: config.label }));

	const statusSelect = createSelect({
		initialValue: initialStatus,
		items: statusItems,
		className: 'w-32',
		onChange: (value) => {
			selectedStatus = value as TaskStatus;
			onChange();
		},
	});

	statusRow.content.append(statusSelect.element);

	// === PRIORITY ===
	const priorityRow = createPropertyRow(priorityIcon, 'Приоритет');

	const priorityItems = Object.entries(TASK_PRIORITY).map(([value, config]) => ({
		value,
		label: config.label,
		color: config.color,
	}));

	const prioritySelect = createSelect({
		initialValue: initialPriority,
		items: priorityItems,
		direction: 'up',
		className: 'w-32',
		onChange: (value) => {
			selectedPriority = value as TaskPriority;
			onChange();
		},
	});

	priorityRow.content.append(prioritySelect.element);

	// === EVENTS ===
	function handleDateChange() {
		setDatesInvalid(!areDatesValid());
		onChange();
	}

	// === ACTION FUNCTIONS ===
	function getValue(): TaskPropertiesValue {
		return {
			status: selectedStatus,
			priority: selectedPriority,
			startDate: startDate.getValue(),
			endDate: endDate.getValue() || null,
		};
	}

	function areDatesValid() {
		const start = startDate.getValue();
		const end = endDate.getValue();
		if (!start || !end) return true;

		return new Date(end).getTime() >= new Date(start).getTime();
	}

	function setDatesInvalid(invalid: boolean) {
		dateError.classList.toggle('hidden', !invalid);
		endDate.element.classList.toggle('border-(--status-error)', invalid);
	}

	// === LIFECYCLE ===
	function destroy() {
		startDate.destroy();
		endDate.destroy();
		statusSelect.destroy();
		prioritySelect.destroy();
	}

	// === ASSEMBLY ===
	element.append(periodRow.element, statusRow.element, priorityRow.element);

	return { element, getValue, areDatesValid, setDatesInvalid, destroy };
};
