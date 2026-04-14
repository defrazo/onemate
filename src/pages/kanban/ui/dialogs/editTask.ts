import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import type { TaskPriority, TaskStatus } from '../../lib';
import { createSvg, customDatePicker, customSelect, getDivider, LIMITS, TASK_PRIORITY, TASK_STATUS } from '../../lib';
import { layout, primitives } from '..';
import { createDialog, createSubmitButton } from '.';

type EditTaskOptions = {
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

type EditTaskInstance = { element: HTMLDivElement; close: () => void };

export const editTask = (options: EditTaskOptions): EditTaskInstance => {
	const icon = createSvg(settingsIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();
	const divider3 = getDivider();
	const divider4 = getDivider();
	const divider5 = getDivider(options.mode === 'create' ? 'hidden' : '');

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление задачи' : 'Редактирование задачи', icon);

	let isClosed = false;

	let selectedStatus: TaskStatus = options.initial.status;
	let selectedPriority: TaskPriority = options.initial.priority;

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'mt-3 gap-3');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = 'task-title';
	labelTitle.textContent = 'Название задачи';
	labelTitle.className = primitives.label;

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initial.title;
	title.id = 'task-title';
	title.autocomplete = 'off';
	title.name = `task-title-${Math.random()}`;
	title.className = primitives.input;

	const onTitleInput = () => {
		updateSubmitState();
		updateTitleHint();
	};
	const onTitleFocus = () => updateTitleHint();
	const onTitleBlur = () => updateTitleHint();

	title.addEventListener('input', onTitleInput);
	title.addEventListener('focus', onTitleFocus);
	title.addEventListener('blur', onTitleBlur);

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
	labelDescription.className = primitives.label;

	const description = document.createElement('textarea');

	description.id = 'task-description';
	description.value = options.initial.description || '';
	description.autocomplete = 'off';
	description.name = `task-description-${Math.random()}`;
	description.className = cn(
		primitives.input,
		'hide-scrollbar min-h-10 resize-none hover:border-(--border-color) xl:min-h-20 2xl:min-h-40'
	);

	const onDescUpdate = () => updateDescHint();
	const onDescFocus = () => updateDescHint();
	const onDescBlur = () => updateDescHint();

	description.addEventListener('input', onDescUpdate);
	description.addEventListener('focus', onDescFocus);
	description.addEventListener('blur', onDescBlur);

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
	deadlinesLabel.className = primitives.label;

	const dates = document.createElement('div');
	dates.className = cn(layout.col, 'gap-4 xl:flex-row xl:items-center');

	// start Date
	const startDateRow = document.createElement('div');
	startDateRow.className = cn(layout.row, 'w-full justify-between');

	const labelStartDateCol = document.createElement('div');
	labelStartDateCol.className = cn(layout.col, 'gap-1');

	const labelStartDate = document.createElement('div');
	labelStartDate.textContent = 'Дата начала';
	labelStartDate.className = cn(primitives.label, 'xl:hidden');

	const labelStartHint = document.createElement('span');
	labelStartHint.textContent = 'Начало периода ';
	labelStartHint.className = cn(primitives.hint, 'xl:hidden');

	labelStartDateCol.append(labelStartDate, labelStartHint);

	const startDate = customDatePicker(options.initial.startDate, 'w-fit min-w-40 xl:w-full');
	startDate.element.addEventListener('dateChange', validateDates);

	startDateRow.append(labelStartDateCol, startDate.element);

	// arrow
	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'hidden select-none xl:block';

	// end Date
	const endDateRow = document.createElement('div');
	endDateRow.className = cn(layout.row, 'w-full justify-between');

	const labelEndDateCol = document.createElement('div');
	labelEndDateCol.className = cn(layout.col, 'gap-1');

	const labelEndDate = document.createElement('div');
	labelEndDate.textContent = 'Дата завершения';
	labelEndDate.className = cn(primitives.label, 'xl:hidden');

	const labelEndHint = document.createElement('span');
	labelEndHint.textContent = 'Конец периода ';
	labelEndHint.className = cn(primitives.hint, 'xl:hidden');

	labelEndDateCol.append(labelEndDate, labelEndHint);

	const endDate = customDatePicker(options.initial.endDate, 'w-fit min-w-40 xl:w-full');
	endDate.element.addEventListener('dateChange', validateDates);

	endDateRow.append(labelEndDateCol, endDate.element);

	dates.append(startDateRow, arrow, endDateRow);

	const deadlinesHint = document.createElement('span');
	deadlinesHint.textContent = 'Дата начала и завершения задачи';
	deadlinesHint.className = cn(primitives.hint, '-mt-2 hidden xl:block');

	deadlinesCol.append(deadlinesLabel, dates, deadlinesHint);

	// === STATUS ===
	const statusRow = document.createElement('div');
	statusRow.className = cn(layout.row, 'justify-between');

	const labelStatusCol = document.createElement('div');
	labelStatusCol.className = cn(layout.col, 'gap-1');

	const labelStatus = document.createElement('div');
	labelStatus.textContent = 'Статус задачи';
	labelStatus.className = primitives.label;

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
			onChange: (value) => (selectedStatus = value as TaskStatus),
		},
		'min-w-32'
	);

	statusContainer.append(customStatus.element);

	statusRow.append(labelStatusCol, statusContainer);

	// === PRIORITY ===
	const proirityRow = document.createElement('div');
	proirityRow.className = cn(layout.row, 'justify-between');

	const labelPriorityCol = document.createElement('div');
	labelPriorityCol.className = cn(layout.col, 'gap-1');

	const labelPriority = document.createElement('div');
	labelPriority.textContent = 'Приоритет задачи';
	labelPriority.className = primitives.label;

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
			onChange: (value) => (selectedPriority = value as TaskPriority),
			direction: options.mode === 'create' ? 'up' : 'down',
		},
		'min-w-32'
	);

	priorityContainer.append(customPriority.element);

	proirityRow.append(labelPriorityCol, priorityContainer);

	// === COMPLETED ===
	const completedRow = document.createElement('div');
	completedRow.className = cn(layout.row, 'justify-between', options.mode === 'create' && 'hidden');

	const labelCompletedCol = document.createElement('div');
	labelCompletedCol.className = cn(layout.col, 'gap-1');

	const labelCompleted = document.createElement('div');
	labelCompleted.textContent = 'Завершено';
	labelCompleted.className = primitives.label;

	const completedHint = document.createElement('span');
	completedHint.textContent = 'Отметить как выполненную';
	completedHint.className = primitives.hint;

	labelCompletedCol.append(labelCompleted, completedHint);

	const completedCheckbox = document.createElement('input');
	completedCheckbox.type = 'checkbox';
	completedCheckbox.id = 'task-completed';
	completedCheckbox.checked = !!options.initial.completed;
	completedCheckbox.className = 'ml-2 size-5 cursor-pointer';

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
			endDate.element.classList.remove('border-(--warning-default)');
			submitButton.disabled = !title.value.trim();
			return true;
		}

		const startTime = new Date(start).getTime();
		const endTime = new Date(end).getTime();

		const valid = endTime >= startTime;

		if (!valid) {
			endDate.element.classList.add('border-(--warning-default)');
			submitButton.disabled = true;
		} else {
			endDate.element.classList.remove('border-(--warning-default)');
			submitButton.disabled = !title.value.trim();
		}

		return valid;
	}

	function getFormData() {
		return {
			title: title.value.trim(),
			description: description.value.trim(),
			status: selectedStatus,
			priority: selectedPriority,
			startDate: startDate.getValue(),
			endDate: endDate.getValue() || null,
			completed: completedCheckbox.checked,
		};
	}

	function updateSubmitState() {
		const data = getFormData();
		const tooLong = data.title.length > LIMITS.TASK_TITLE;

		submitButton.disabled = !data.title || tooLong;
	}

	function updateTitleHint() {
		const trimmedTitle = title.value.trim();
		const length = trimmedTitle.length;
		const tooLong = trimmedTitle.length > LIMITS.TASK_TITLE;

		if (!trimmedTitle) titleHint.textContent = `Введите название (до ${LIMITS.TASK_TITLE} символов)`;
		else titleHint.textContent = `${length} / ${LIMITS.TASK_TITLE} символов`;

		titleHint.className = cn(primitives.hint, '-mt-2', tooLong && 'text-(--status-error)');
	}

	function updateDescHint() {
		const trimmedDesc = description.value.trim();
		const length = trimmedDesc.length;
		const tooLong = trimmedDesc.length > LIMITS.TASK_DESC;

		if (!trimmedDesc) descriptionHint.textContent = `Введите комментарий (до ${LIMITS.TASK_DESC} символов)`;
		else descriptionHint.textContent = `${length} / ${LIMITS.TASK_DESC} символов`;

		descriptionHint.className = cn(primitives.hint, '-mt-2', tooLong && 'text-(--status-error)');
	}

	function cleanup() {
		title.removeEventListener('input', onTitleInput);
		title.removeEventListener('focus', onTitleFocus);
		title.removeEventListener('blur', onTitleBlur);

		description.removeEventListener('input', onDescUpdate);
		description.removeEventListener('focus', onDescFocus);
		description.removeEventListener('blur', onDescBlur);

		startDate.element.removeEventListener('dateChange', validateDates);
		endDate.element.removeEventListener('dateChange', validateDates);

		customStatus.destroy();
		customPriority.destroy();
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		cleanup();
		closeDialog();
	}

	updateSubmitState();
	updateTitleHint();

	// === ASSEMBLY ===
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

	return { element: overlay, close };
};
