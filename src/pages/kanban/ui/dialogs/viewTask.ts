import viewIcon from '@/shared/assets/icons/system/indicators/eye.svg?raw';
import { cn } from '@/shared/lib/utils';

import { createSvg, customDatePicker } from '../../lib';
import { layout, primitives } from '..';
import { createDialog, createSubmitButton } from '.';

type ViewTaskOptions = {
	initial: { title: string; description?: string; startDate: string; endDate: string | null; completed: boolean };
	onSubmit: (completed: boolean) => void;
};

type ViewTaskInstance = { element: HTMLDivElement; close: () => void };

export const viewTask = (options: ViewTaskOptions): ViewTaskInstance => {
	const icon = createSvg(viewIcon, 'size-5');

	const { overlay, container, close: closeDialog } = createDialog('Детали задачи', icon);

	let isClosed = false;

	const isCompleted = !!options.initial.completed;

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'mt-3 gap-3');

	const labelTitle = document.createElement('div');
	labelTitle.textContent = 'Задача';
	labelTitle.className = primitives.label;

	const title = document.createElement('h1');
	title.textContent = options.initial.title;
	title.className = cn(primitives.input, 'hover:border-(--border-color)');

	titleCol.append(labelTitle, title);

	// === DESCRIPTION ===
	const descriptionCol = document.createElement('div');
	descriptionCol.className = cn(layout.col, 'gap-2');

	const labelDescription = document.createElement('div');
	labelDescription.textContent = 'Комментарий';
	labelDescription.className = primitives.label;

	const description = document.createElement('p');
	description.textContent = options.initial.description || 'Комментариев нет';
	description.className = cn(
		primitives.input,
		'hide-scrollbar min-h-10 resize-none hover:border-(--border-color) xl:min-h-20 2xl:min-h-40'
	);

	descriptionCol.append(labelDescription, description);

	// === DEADLINES ===
	const deadlinesCol = document.createElement('div');
	deadlinesCol.className = cn(layout.col, 'gap-2');

	const deadlinesLabel = document.createElement('span');
	deadlinesLabel.textContent = 'Период выполнения';
	deadlinesLabel.className = cn(primitives.label, 'hidden xl:block');

	const dates = document.createElement('div');
	dates.className = cn(layout.col, 'gap-4 xl:flex-row xl:items-center');

	// Start Date
	const startDateRow = document.createElement('div');
	startDateRow.className = cn(layout.row, 'w-full justify-between');

	const labelStartDate = document.createElement('div');
	labelStartDate.textContent = 'Дата начала';
	labelStartDate.className = cn(primitives.label, 'xl:hidden');

	const startDate = customDatePicker(options.initial.startDate, 'w-fit min-w-40 xl:w-full', 'readonly');

	startDateRow.append(labelStartDate, startDate.element);

	// Arrow
	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'hidden select-none xl:block';

	// End Date
	const endDateRow = document.createElement('div');
	endDateRow.className = cn(layout.row, 'w-full justify-between');

	const labelEndDate = document.createElement('div');
	labelEndDate.textContent = 'Дата завершения';
	labelEndDate.className = cn(primitives.label, 'xl:hidden');

	const endDate = customDatePicker(options.initial.endDate, 'w-fit min-w-40 xl:w-full', 'readonly');

	endDateRow.append(labelEndDate, endDate.element);

	dates.append(startDateRow, arrow, endDateRow);

	deadlinesCol.append(deadlinesLabel, dates);

	// === SUBMIT BUTTON ===
	const submitButton = createSubmitButton(isCompleted ? 'Возобновить' : 'Завершить', () =>
		handleSubmit(!isCompleted)
	);

	// === ACTION FUNCTIONS ===
	function handleSubmit(completed: boolean) {
		options.onSubmit(completed);
		close();
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		closeDialog();
	}

	// === ASSEMBLY ===
	container.append(titleCol, descriptionCol, deadlinesCol, submitButton);

	return { element: overlay, close };
};
