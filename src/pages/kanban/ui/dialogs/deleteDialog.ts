import { cn } from '@/shared/lib/utils';

import { controls, layout } from '../styles';
import { createDialog } from '.';

export const deleteDialog = (title: string, content: string, onDelete: () => void): HTMLElement => {
	const { overlay, container, close } = createDialog(title);

	// === QUESTION TEXT ===
	const question = document.createElement('span');
	question.textContent = content;
	question.className = 'text-md my-2 select-none text-center';

	// === BUTTONS ROW ===
	const buttonsRow = document.createElement('div');
	buttonsRow.className = cn(layout.row);

	const confirmButton = document.createElement('button');
	confirmButton.type = 'button';
	confirmButton.textContent = 'Удалить';
	confirmButton.className = cn(controls.button);
	confirmButton.addEventListener('click', () => {
		onDelete();
		close();
	});

	const cancelButton = document.createElement('button');
	cancelButton.type = 'button';
	cancelButton.textContent = 'Отмена';
	cancelButton.className = cn(controls.button);
	cancelButton.addEventListener('click', close);

	buttonsRow.append(confirmButton, cancelButton);

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(question, buttonsRow);

	return overlay;
};
