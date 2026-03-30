import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import type { TaskPriority, TaskStatus } from '../../lib';
import { createSvg, customDatePicker, customSelect, getDivider, LIMITS, TASK_PRIORITY, TASK_STATUS } from '../../lib';
import { layout, primitives } from '..';
import { createDialog, createSubmitButton } from '.';

type EditTaskDialogOptions = {
	mode: 'create' | 'edit';
	initial: {
		title: string;
		description?: string;
		status: TaskStatus;
		priority: TaskPriority;
		startDate: string;
		endDate: string | null;
		completed: boolean;
	};
	onSubmit: (
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		startDate: string,
		endDate: string | null,
		completed: boolean
	) => void;
};

export const editTaskDialog = (options: EditTaskDialogOptions): HTMLElement => {
	const icon = createSvg(settingsIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();
	const divider3 = getDivider();
	const divider4 = getDivider();
	const divider5 = getDivider(options.mode === 'create' ? 'hidden' : '');

	const { overlay, container, close } = createDialog(
		options.mode === 'create' ? 'Добавление задачи' : 'Редактирование задачи',
		icon
	);

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-3 mt-3');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = 'task-title';
	labelTitle.textContent = 'Название задачи';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initial.title;
	title.id = 'task-title';
	title.autocomplete = 'off';
	title.name = `task-title-${Math.random()}`;
	title.className = primitives.input;
	title.addEventListener('input', () => {
		updateSubmitState();
		updateTitleHint('focus');
	});
	title.addEventListener('focus', () => updateTitleHint('focus'));
	title.addEventListener('blur', () => updateTitleHint('blur'));

	const titleHint = document.createElement('span');
	titleHint.textContent = options.initial.title
		? `${title.value.length} / ${LIMITS.TASK_TITLE} символов`
		: `Введите название (до ${LIMITS.TASK_TITLE} символов)`;
	titleHint.className = cn(primitives.hint, '-mt-2');

	titleCol.append(labelTitle, title, titleHint);

	// === DESCRIPTION ===
	const descriptionCol = document.createElement('div');
	descriptionCol.className = cn(layout.col, 'gap-3');

	const labelDescription = document.createElement('label');
	labelDescription.htmlFor = 'task-description';
	labelDescription.textContent = 'Комментарий (необязательно)';
	labelDescription.className = 'leading-4 select-none';

	const description = document.createElement('textarea');

	description.name = 'description';
	description.id = 'task-description';
	description.value = options.initial.description || '';
	description.autocomplete = 'off';
	description.name = `task-description-${Math.random()}`;
	description.className = cn(primitives.input, 'min-h-10 xl:min-h-40 resize-none hide-scrollbar');
	description.addEventListener('input', () => updateDescHint('focus'));
	description.addEventListener('focus', () => updateDescHint('focus'));
	description.addEventListener('blur', () => updateDescHint('blur'));

	const descriptionHint = document.createElement('span');
	descriptionHint.textContent = options.initial.description
		? `${description.value.length} / ${LIMITS.TASK_DESC} символов`
		: `Введите комментарий (до ${LIMITS.TASK_DESC} символов)`;
	descriptionHint.className = cn(primitives.hint, '-mt-2');

	descriptionCol.append(labelDescription, description, descriptionHint);

	// === DEADLINES ===
	const deadlinesCol = document.createElement('div');
	deadlinesCol.className = cn(layout.col, 'gap-3');

	const deadlinesLabel = document.createElement('span');
	deadlinesLabel.textContent = 'Период выполнения';
	deadlinesLabel.className = 'leading-4 select-none';

	const dates = document.createElement('div');
	dates.className = cn('flex flex-col xl:flex-row gap-4 xl:items-center');

	// Start Date
	const startDateRow = document.createElement('div');
	startDateRow.className = cn(layout.row, 'justify-between w-full');

	const labelStartDateCol = document.createElement('div');
	labelStartDateCol.className = cn(layout.col, 'gap-1');

	const labelStartDate = document.createElement('div');
	labelStartDate.textContent = 'Дата начала';
	labelStartDate.className = 'xl:hidden leading-4 select-none';

	const labelStartHint = document.createElement('span');
	labelStartHint.textContent = 'Начало периода ';
	labelStartHint.className = cn(primitives.hint, 'xl:hidden');

	labelStartDateCol.append(labelStartDate, labelStartHint);

	const startDate = customDatePicker(options.initial.startDate, 'min-w-40 w-fit xl:w-full');
	startDate.element.addEventListener('dateChange', validateDates);

	startDateRow.append(labelStartDateCol, startDate.element);

	// Arrow
	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'select-none xl:block hidden';

	// End Date
	const endDateRow = document.createElement('div');
	endDateRow.className = cn(layout.row, 'justify-between w-full');

	const labelEndDateCol = document.createElement('div');
	labelEndDateCol.className = cn(layout.col, 'gap-1');

	const labelEndDate = document.createElement('div');
	labelEndDate.textContent = 'Дата завершения';
	labelEndDate.className = 'xl:hidden leading-4 select-none';

	const labelEndHint = document.createElement('span');
	labelEndHint.textContent = 'Конец периода ';
	labelEndHint.className = cn(primitives.hint, 'xl:hidden');

	labelEndDateCol.append(labelEndDate, labelEndHint);

	const endDate = customDatePicker(options.initial.endDate, 'min-w-40 w-fit xl:w-full');
	endDate.element.addEventListener('dateChange', validateDates);

	endDateRow.append(labelEndDateCol, endDate.element);

	dates.append(startDateRow, arrow, endDateRow);

	const deadlinesHint = document.createElement('span');
	deadlinesHint.textContent = 'Дата начала и завершения задачи';
	deadlinesHint.className = cn(primitives.hint, '-mt-2 xl:block hidden');

	deadlinesCol.append(deadlinesLabel, dates, deadlinesHint);

	// === STATUS ===
	const statusRow = document.createElement('div');
	statusRow.className = cn(layout.row, 'justify-between');

	const labelStatusCol = document.createElement('div');
	labelStatusCol.className = cn(layout.col, 'gap-1');

	const labelStatus = document.createElement('div');
	labelStatus.textContent = 'Статус задачи';
	labelStatus.className = 'leading-4 select-none';

	const statusHint = document.createElement('span');
	statusHint.textContent = 'Показывает этап выполнения';
	statusHint.className = primitives.hint;

	labelStatusCol.append(labelStatus, statusHint);

	const statusContainer = document.createElement('div');
	statusContainer.id = 'task-status';

	const statusItems = Object.entries(TASK_STATUS).map(([key, cfg]) => ({
		value: key,
		label: cfg.label,
	}));

	const customStatus = customSelect(
		{
			initialValue: options.initial.status || 'В работе',
			items: statusItems,
			onChange: (value) => (options.initial.status = value as TaskStatus),
		},
		'min-w-32'
	);

	statusContainer.append(customStatus);

	statusRow.append(labelStatusCol, statusContainer);

	// === PRIORITY ===
	const proirityRow = document.createElement('div');
	proirityRow.className = cn(layout.row, 'justify-between');

	const labelPriorityCol = document.createElement('div');
	labelPriorityCol.className = cn(layout.col, 'gap-1');

	const labelPriority = document.createElement('div');
	labelPriority.textContent = 'Приоритет задачи';
	labelPriority.className = 'leading-4 select-none';

	const priorityHint = document.createElement('span');
	priorityHint.textContent = 'Определяет важность задачи';
	priorityHint.className = primitives.hint;

	labelPriorityCol.append(labelPriority, priorityHint);

	const priorityContainer = document.createElement('div');
	priorityContainer.id = 'task-priority';

	const priorityItems = Object.entries(TASK_PRIORITY).map(([key, cfg]) => ({
		value: key,
		label: cfg.label,
	}));

	const customPriority = customSelect(
		{
			initialValue: options.initial.priority || 'Обычный',
			items: priorityItems,
			onChange: (value) => (options.initial.priority = value as TaskPriority),
			direction: options.mode === 'create' ? 'up' : 'down',
		},
		'min-w-32'
	);

	priorityContainer.append(customPriority);

	proirityRow.append(labelPriorityCol, priorityContainer);

	// === COMPLETED ===
	const completedRow = document.createElement('div');
	completedRow.className = cn(layout.row, 'justify-between', options.mode === 'create' && 'hidden');

	const labelCompletedCol = document.createElement('div');
	labelCompletedCol.className = cn(layout.col, 'gap-1');

	const labelCompleted = document.createElement('div');
	labelCompleted.textContent = 'Завершено';
	labelCompleted.className = 'leading-4 select-none';

	const completedHint = document.createElement('span');
	completedHint.textContent = 'Отметить как выполненную';
	completedHint.className = primitives.hint;

	labelCompletedCol.append(labelCompleted, completedHint);

	const completedCheckbox = document.createElement('input');
	completedCheckbox.type = 'checkbox';
	completedCheckbox.id = 'task-completed';
	completedCheckbox.checked = !!options.initial.completed;
	completedCheckbox.className = 'ml-2 cursor-pointer size-5';

	completedRow.append(labelCompletedCol, completedCheckbox);

	// === SUBMIT BUTTON ===
	const submitButton = createSubmitButton(options.mode === 'create' ? 'Добавить' : 'Сохранить', handleSubmit);

	// === ACTION FUNCTIONS ===
	function handleSubmit() {
		if (!validateDates()) return;

		const data = getFormData();
		if (!data.title) return;

		options.onSubmit(
			data.title,
			data.description,
			data.status,
			data.priority,
			data.startDate,
			data.endDate,
			data.completed
		);
		close();
	}

	function validateDates() {
		const start = startDate.getValue();
		const end = endDate.getValue();

		if (!start || !end) {
			endDate.element.classList.remove('border-red-500');
			submitButton.disabled = !title.value.trim();
			return true;
		}

		const startTime = new Date(start).getTime();
		const endTime = new Date(end).getTime();

		const valid = endTime >= startTime;

		if (!valid) {
			endDate.element.classList.add('border-red-500');
			submitButton.disabled = true;
		} else {
			endDate.element.classList.remove('border-red-500');
			submitButton.disabled = !title.value.trim();
		}

		return valid;
	}

	const getFormData = () => {
		return {
			title: title.value.trim(),
			description: description.value.trim(),
			status: options.initial.status,
			priority: options.initial.priority,
			startDate: startDate.getValue(),
			endDate: endDate.getValue() || null,
			completed: completedCheckbox.checked,
		};
	};

	const updateSubmitState = () => {
		const data = getFormData();
		const tooLong = data.title.length > LIMITS.TASK_TITLE;

		submitButton.disabled = !data.title || tooLong;
	};

	const updateTitleHint = (event: 'focus' | 'blur') => {
		const length = title.value.length;

		if (event === 'focus' && length >= 1) {
			titleHint.textContent = `${length} / ${LIMITS.TASK_TITLE} символов`;
			titleHint.className = cn(primitives.hint, '-mt-2', length > LIMITS.TASK_TITLE && 'text-red-500');
		} else if (!title.value.trim()) titleHint.textContent = `Введите название (до ${LIMITS.TASK_TITLE} символов)`;
	};

	const updateDescHint = (event: 'focus' | 'blur') => {
		const length = description.value.length;

		if (event === 'focus' && length >= 1) {
			descriptionHint.textContent = `${length} / ${LIMITS.TASK_DESC} символов`;
			descriptionHint.className = cn(primitives.hint, '-mt-2', length > LIMITS.TASK_DESC && 'text-red-500');
		} else if (!description.value.trim())
			descriptionHint.textContent = `Введите комментарий (до ${LIMITS.TASK_DESC} символов)`;
	};

	updateSubmitState();

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(
		titleCol,
		divider1,
		descriptionCol,
		divider2,
		deadlinesCol,
		divider3,
		statusRow,
		divider4,
		proirityRow,
		divider5,
		completedRow,
		submitButton
	);

	return overlay;
};
