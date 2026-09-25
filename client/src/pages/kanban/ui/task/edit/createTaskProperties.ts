import { arrowIcon, calendarIcon, checkIcon, insertSvg, priorityIcon, statusIcon } from '../../../lib';
import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '../../../model';
import { createDatePicker, createPropertyRow, createSelect, type PropertyRowInstance } from '../../components';

type CreateTaskPropertiesProps = {
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
	completed: boolean;
	showCompleted: boolean;
	onChange: () => void;
};

type TaskPropertiesValue = {
	status: TaskStatus;
	priority: TaskPriority;
	startDate: string;
	endDate: string | null;
	completed: boolean;
};

export const createTaskProperties = ({
	status: initialStatus,
	priority: initialPriority,
	startDate: initialStartDate,
	endDate: initialEndDate,
	completed: initialCompleted,
	showCompleted,
	onChange,
}: CreateTaskPropertiesProps) => {
	let selectedStatus = initialStatus;
	let selectedPriority = initialPriority;

	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-xl border border-(--border-color) bg-white/3 select-none';

	// === PERIOD ===
	const periodRow = createPropertyRow(calendarIcon, 'Период');

	const periodControl = document.createElement('div');
	periodControl.className = 'flex min-w-0 items-center gap-2';

	const startDate = createDatePicker({ value: initialStartDate, className: 'w-32' });

	const arrow = document.createElement('div');
	arrow.className = 'flex size-5 shrink-0 items-center justify-center text-(--color-disabled)';
	insertSvg(arrow, arrowIcon, 'size-5');

	const endDate = createDatePicker({ value: initialEndDate, className: 'w-32' });

	periodControl.append(startDate.element, arrow, endDate.element);

	periodRow.content.append(periodControl);

	// === DATE ERROR ===
	const dateError = document.createElement('span');
	dateError.textContent = 'Дата завершения не может быть раньше даты начала';
	dateError.className = 'hidden px-3 pb-2 text-sm text-(--status-error) opacity-70';

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

	const priorityItems = Object.entries(TASK_PRIORITY).map(([value, config]) => ({ value, label: config.label }));

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

	// === COMPLETED ===
	let completedRow: PropertyRowInstance | null = null;
	let completed: HTMLInputElement | null = null;

	if (showCompleted) {
		completedRow = createPropertyRow(checkIcon, 'Завершено');

		completed = document.createElement('input');
		completed.type = 'checkbox';
		completed.checked = initialCompleted;
		completed.className = 'size-4 shrink-0 cursor-pointer accent-(--accent-default)';

		completedRow.content.append(completed);
	}

	// === EVENTS ===
	const onStartDateChange = () => {
		setDatesInvalid(!areDatesValid());
		onChange();
	};

	const onEndDateChange = () => {
		setDatesInvalid(!areDatesValid());
		onChange();
	};

	const onCompletedChange = () => onChange();

	startDate.element.addEventListener('dateChange', onStartDateChange);
	endDate.element.addEventListener('dateChange', onEndDateChange);
	completed?.addEventListener('change', onCompletedChange);

	// === ACTION FUNCTIONS ===
	function getValue(): TaskPropertiesValue {
		return {
			status: selectedStatus,
			priority: selectedPriority,
			startDate: startDate.getValue(),
			endDate: endDate.getValue() || null,
			completed: completed?.checked ?? initialCompleted,
		};
	}

	function areDatesValid(): boolean {
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
		startDate.element.removeEventListener('dateChange', onStartDateChange);
		endDate.element.removeEventListener('dateChange', onEndDateChange);
		completed?.removeEventListener('change', onCompletedChange);

		startDate.destroy();
		endDate.destroy();
		statusSelect.destroy();
		prioritySelect.destroy();
	}

	// === ASSEMBLY ===
	element.append(periodRow.element, dateError, statusRow.element, priorityRow.element);
	if (completedRow) element.append(completedRow.element);

	return { element, getValue, areDatesValid, setDatesInvalid, destroy };
};
