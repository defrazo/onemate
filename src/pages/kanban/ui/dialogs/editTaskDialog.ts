import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import {
	createCustomSelect,
	createSvg,
	generateId,
	getDivider,
	TASK_PRIORITY,
	TASK_STATUS,
	TaskPriority,
	TaskStatus,
} from '../../lib';
import { controls, layout, primitives } from '../styles';
import { createDialog } from '.';

type EditTaskDialogOptions = {
	mode: 'create' | 'edit';
	initialData: {
		title: string;
		description?: string;
		status: TaskStatus;
		priority: TaskPriority;
		startDate: string;
		endDate?: string | null;
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
	const titleId = generateId('task-title');

	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-2 mt-2');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = titleId;
	labelTitle.textContent = 'Название задачи';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initialData.title;
	title.id = titleId;
	title.className = cn(
		primitives.input,
		'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color) hover:border-(--accent-hover)'
	);
	title.addEventListener('input', () => updateSubmitState());

	const titleHint = document.createElement('span');
	titleHint.textContent = 'Введите название';
	titleHint.className = 'text-(--color-secondary) select-none -mt-1 opacity-70 text-sm';

	titleCol.append(labelTitle, title, titleHint);

	// === DESCRIPTION ===
	const descriptionId = generateId('task-description');

	const descriptionCol = document.createElement('div');
	descriptionCol.className = cn(layout.col, 'gap-2');

	const labelDescription = document.createElement('label');
	labelDescription.htmlFor = descriptionId;
	labelDescription.textContent = 'Комментарий';
	labelDescription.className = 'leading-4 select-none';

	const description = document.createElement('textarea');
	description.id = descriptionId;
	description.name = 'description';
	description.value = options.initialData.description || '';
	description.className = cn(
		primitives.input,
		'flex-1 min-h-40 bg-(--bg-tertiary)/50 resize-none border border-(--border-color) hover:border-(--accent-hover)'
	);

	const descriptionHint = document.createElement('span');
	descriptionHint.textContent = 'Введите комментарий к задаче (необязательно)';
	descriptionHint.className = 'text-(--color-secondary) -mt-1 select-none opacity-70 text-sm';

	descriptionCol.append(labelDescription, description, descriptionHint);

	// === DEADLINES ===
	const deadlinesCol = document.createElement('div');
	deadlinesCol.className = cn(layout.col, 'gap-2');

	const deadlinesLabel = document.createElement('span');
	deadlinesLabel.textContent = 'Период выполнения';
	deadlinesLabel.className = 'leading-4 select-none';

	const dates = document.createElement('div');
	dates.className = cn(layout.row, 'gap-4 items-center');

	const startDate = document.createElement('input');
	startDate.type = 'date';
	startDate.name = 'startDate';
	startDate.value = options.initialData.startDate;
	startDate.className = cn(
		primitives.input,
		'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color) hover:border-(--accent-hover)'
	);

	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'select-none';

	const endDate = document.createElement('input');
	endDate.type = 'date';
	endDate.name = 'endDate';
	endDate.value = options.initialData.endDate || '';
	endDate.className = cn(
		primitives.input,
		'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color) hover:border-(--accent-hover)'
	);

	dates.append(startDate, arrow, endDate);

	const deadlinesHint = document.createElement('span');
	deadlinesHint.textContent = 'Введите дату начала и завершения задачи';
	deadlinesHint.className = 'text-(--color-secondary) -mt-1 select-none opacity-70 text-sm';

	deadlinesCol.append(deadlinesLabel, dates, deadlinesHint);

	// === STATUS ===
	const statusId = generateId('column-limit');

	const statusRow = document.createElement('div');
	statusRow.className = cn(layout.row, layout.between, '');

	const labelStatusCol = document.createElement('div');
	labelStatusCol.className = cn(layout.col, 'gap-1');

	const labelStatus = document.createElement('label');
	labelStatus.htmlFor = statusId;
	labelStatus.textContent = 'Статус задачи';
	labelStatus.className = 'leading-4 select-none';

	const statusHint = document.createElement('span');
	statusHint.textContent = 'Укажите текущий статус задачи';
	statusHint.className = 'text-(--color-secondary) select-none opacity-70 text-sm';

	labelStatusCol.append(labelStatus, statusHint);

	const statusContainer = document.createElement('div');
	statusContainer.id = statusId;

	const statusItems = Object.entries(TASK_STATUS).map(([key, cfg]) => ({
		value: key,
		label: cfg.label,
	}));

	const customStatus = createCustomSelect(
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
	const priorityId = generateId('column-limit');

	const proirityRow = document.createElement('div');
	proirityRow.className = cn(layout.row, layout.between, '');

	const labelPriorityCol = document.createElement('div');
	labelPriorityCol.className = cn(layout.col, 'gap-1');

	const labelPriority = document.createElement('label');
	labelPriority.htmlFor = priorityId;
	labelPriority.textContent = 'Приоритет задачи';
	labelPriority.className = 'leading-4 select-none';

	const priorityHint = document.createElement('span');
	priorityHint.textContent = 'Укажите приоритет задачи';
	priorityHint.className = 'text-(--color-secondary) select-none opacity-70 text-sm';

	labelPriorityCol.append(labelPriority, priorityHint);

	const priorityContainer = document.createElement('div');
	priorityContainer.id = priorityId;

	const priorityItems = Object.entries(TASK_PRIORITY).map(([key, cfg]) => ({
		value: key,
		label: cfg.label,
	}));

	const customPriority = createCustomSelect(
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
	submitButton.className = cn(controls.button, 'mt-1');
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
			start: startDate.value,
			end: endDate.value || null,
		};
	};

	function updateSubmitState() {
		submitButton.disabled = !getFormData().title;
	}

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
