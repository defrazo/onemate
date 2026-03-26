import viewIcon from '@/shared/assets/icons/system/indicators/eye.svg?raw';
import { cn } from '@/shared/lib/utils';

import { createSvg, customDatePicker, getDivider } from '../../lib';
import { button, layout, primitives } from '../styles';
import { createDialog } from '.';

type ViewTaskDialogOptions = {
	initialData: { title: string; description?: string; startDate: string; endDate: string | null };
};

export const viewTaskDialog = (options: ViewTaskDialogOptions): HTMLElement => {
	const icon = createSvg(viewIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();

	const { overlay, container, close } = createDialog('Детали задачи', icon);

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-3 mt-3');

	const labelTitle = document.createElement('div');
	labelTitle.textContent = 'Задача';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('h1');
	title.textContent = options.initialData.title;
	title.className = cn(primitives.input, 'hover:border-(--border-color)');

	titleCol.append(labelTitle, title);

	// === DESCRIPTION ===
	const descriptionCol = document.createElement('div');
	descriptionCol.className = cn(layout.col, 'gap-2');

	const labelDescription = document.createElement('div');
	labelDescription.textContent = 'Комментарий';
	labelDescription.className = 'leading-4 select-none';

	const description = document.createElement('p');
	description.textContent = options.initialData.description || 'Комментариев нет';
	description.className = cn(primitives.input, 'min-h-40 hover:border-(--border-color)');

	descriptionCol.append(labelDescription, description);

	// === DEADLINES ===
	const deadlinesCol = document.createElement('div');
	deadlinesCol.className = cn(layout.col, 'gap-2');

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

	const startDate = customDatePicker(options.initialData.startDate, 'min-w-40 w-fit xl:w-full', 'readonly');

	startDateRow.append(labelStartDate, startDate.element);

	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'select-none xl:block hidden';

	const endDateRow = document.createElement('div');
	endDateRow.className = cn(layout.row, 'justify-between w-full');

	const labelEndDate = document.createElement('div');
	labelEndDate.textContent = 'Дата завершения';
	labelEndDate.className = 'xl:hidden leading-4 select-none';

	const endDate = customDatePicker(options.initialData.endDate, 'min-w-40 w-fit xl:w-full', 'readonly');

	endDateRow.append(labelEndDate, endDate.element);
	dates.append(startDateRow, arrow, endDateRow);

	deadlinesCol.append(deadlinesLabel, dates);

	// === SUBMIT BUTTON ===
	const submitButton = document.createElement('button');
	submitButton.type = 'button';
	submitButton.textContent = 'Завершить';
	submitButton.className = cn(button.default, 'w-52 mt-2 mx-auto');
	submitButton.addEventListener('click', () => handleSubmit());

	// === ACTION FUNCTIONS ===
	const handleSubmit = () => {
		close();
	};

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(titleCol, divider1, descriptionCol, divider2, deadlinesCol, submitButton);

	return overlay;
};
