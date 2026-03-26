import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import {
	createSvg,
	customDatePicker,
	customSelect,
	getDivider,
	LIMITS,
	TASK_PRIORITY,
	TASK_STATUS,
	type TaskPriority,
	type TaskStatus,
} from '../../lib';
import { button, layout, primitives } from '../styles';
import { createDialog } from '.';

type EditTaskDialogOptions = {
	mode: 'create' | 'edit';
	initialData: {
		title: string;
		description?: string;
		status: TaskStatus;
		priority: TaskPriority;
		startDate: string;
		endDate: string | null;
	};
	onSubmit: (
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		startDate: string,
		endDate: string | null
	) => void;
};

export const editTaskDialog = (options: EditTaskDialogOptions): HTMLElement => {
	const icon = createSvg(settingsIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();
	const divider3 = getDivider();
	const divider4 = getDivider();

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
	title.value = options.initialData.title;
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
	titleHint.textContent = options.initialData.title
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
	description.value = options.initialData.description || '';
	description.autocomplete = 'off';
	description.name = `task-description-${Math.random()}`;
	description.className = cn(primitives.input, 'min-h-10 xl:min-h-40 resize-none hide-scrollbar');
	description.addEventListener('input', () => updateDescHint('focus'));
	description.addEventListener('focus', () => updateDescHint('focus'));
	description.addEventListener('blur', () => updateDescHint('blur'));

	const descriptionHint = document.createElement('span');
	descriptionHint.textContent = options.initialData.description
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

	const startDateRow = document.createElement('div');
	startDateRow.className = cn(layout.row, 'justify-between w-full');

	const labelStartDate = document.createElement('div');
	labelStartDate.textContent = 'Дата начала';
	labelStartDate.className = 'xl:hidden leading-4 select-none';

	const startDate = customDatePicker(options.initialData.startDate, 'min-w-40 w-fit xl:w-full');

	startDateRow.append(labelStartDate, startDate.element);

	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'select-none xl:block hidden';

	const endDateRow = document.createElement('div');
	endDateRow.className = cn(layout.row, 'justify-between w-full');

	const labelEndDate = document.createElement('div');
	labelEndDate.textContent = 'Дата завершения';
	labelEndDate.className = 'xl:hidden leading-4 select-none';

	const endDate = customDatePicker(options.initialData.endDate, 'min-w-40 w-fit xl:w-full');

	endDateRow.append(labelEndDate, endDate.element);

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
			initialValue: options.initialData.status || 'В работе',
			items: statusItems,
			onChange: (value) => (options.initialData.status = value as TaskStatus),
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
			initialValue: options.initialData.priority || 'Обычный',
			items: priorityItems,
			onChange: (value) => (options.initialData.priority = value as TaskPriority),
		},
		'min-w-32'
	);

	priorityContainer.append(customPriority);

	proirityRow.append(labelPriorityCol, priorityContainer);

	// === SUBMIT BUTTON ===
	const submitButton = document.createElement('button');
	submitButton.type = 'button';
	submitButton.textContent = options.mode === 'create' ? 'Добавить' : 'Сохранить';
	submitButton.className = cn(button.default, 'w-52 mt-2 mx-auto');
	submitButton.addEventListener('click', () => handleSubmit());

	// === ACTION FUNCTIONS ===
	const handleSubmit = () => {
		const data = getFormData();
		if (!data.title) return;

		options.onSubmit(data.title, data.description, data.status, data.priority, data.start, data.end);
		close();
	};

	const getFormData = () => {
		return {
			title: title.value.trim(),
			description: description.value.trim(),
			status: options.initialData.status,
			priority: options.initialData.priority,
			start: startDate.getValue(),
			end: endDate.getValue() || null,
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
		submitButton
	);

	updateSubmitState();

	return overlay;
};
