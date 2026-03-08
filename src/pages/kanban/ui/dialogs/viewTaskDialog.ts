import { cn } from '@/shared/lib/utils';

import { getDivider } from '../../lib';
import { controls, layout, primitives } from '../styles';
import { createDialog } from '.';

type ViewTaskDialogOptions = {
	initialData: {
		title: string;
		description?: string;
		startDate: string;
		endDate?: string | null;
	};
};

export const viewTaskDialog = (options: ViewTaskDialogOptions): HTMLElement => {
	const { overlay, container, close } = createDialog('Детали задачи');
	const divider1 = getDivider();
	const divider2 = getDivider();

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-2 mt-3');

	const labelTitle = document.createElement('span');
	labelTitle.textContent = 'Задача';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('h1');
	title.textContent = options.initialData.title;
	title.className = cn(primitives.input, 'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color)');

	titleCol.append(labelTitle, title);

	// === DESCRIPTION ===
	const descriptionCol = document.createElement('div');
	descriptionCol.className = cn(layout.col, 'gap-2');

	const labelDescription = document.createElement('span');
	labelDescription.textContent = 'Комментарий';
	labelDescription.className = 'leading-4 select-none';

	const description = document.createElement('p');
	description.textContent = options.initialData.description || 'Комментариев нет';
	description.className = cn(
		primitives.input,
		'flex-1 min-h-40 bg-(--bg-tertiary)/50 border border-(--border-color)'
	);

	descriptionCol.append(labelDescription, description);

	// === DEADLINES ===
	const deadlinesCol = document.createElement('div');
	deadlinesCol.className = cn(layout.col, 'gap-2');

	const deadlinesLabel = document.createElement('span');
	deadlinesLabel.textContent = 'Период выполнения';
	deadlinesLabel.className = 'leading-4 select-none';

	const dates = document.createElement('div');
	dates.className = cn(layout.row, 'gap-3 items-center');

	const startDate = document.createElement('input');
	startDate.type = 'date';
	startDate.name = 'startDate';
	startDate.value = options.initialData.startDate;
	startDate.disabled = true;
	startDate.className = cn(primitives.input, 'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color)');

	const arrow = document.createElement('span');
	arrow.textContent = '⟶';
	arrow.className = 'select-none';

	const endDate = document.createElement('input');
	endDate.type = 'date';
	endDate.name = 'endDate';
	endDate.value = options.initialData.endDate || '';
	endDate.disabled = true;
	endDate.className = cn(primitives.input, 'flex-1 bg-(--bg-tertiary)/50 border border-(--border-color)');

	dates.append(startDate, arrow, endDate);

	deadlinesCol.append(deadlinesLabel, dates);

	// === SUBMIT BUTTON ===
	const submitButton = document.createElement('button');
	submitButton.type = 'button';
	submitButton.textContent = 'Завершить';
	submitButton.className = cn(controls.button, 'mt-1');
	submitButton.addEventListener('click', () => handleSubmit());

	// === ACTION FUNCTIONS ===
	const handleSubmit = () => {
		// options.onSubmit();
		close();
	};

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(titleCol, divider1, descriptionCol, divider2, deadlinesCol, submitButton);

	return overlay;
};
