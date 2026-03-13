import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import { cn } from '@/shared/lib/utils';

import { createSvg } from '../../lib';
import { button, layout } from '../styles';
import { createDialog } from '.';

export const deleteDialog = (title: string, content: string, onDelete: () => void): HTMLElement => {
	const icon = createSvg(deleteIcon, 'size-5');

	const { overlay, container, close } = createDialog(title, icon);

	// === QUESTION TEXT ===
	const question = document.createElement('span');
	question.textContent = content;
	question.className = 'text-md mt-3 select-none text-center';

	// === BUTTONS ROW ===
	const buttonsRow = document.createElement('div');
	buttonsRow.className = cn(layout.row, 'gap-4');

	const confirmButton = document.createElement('button');
	confirmButton.type = 'button';
	confirmButton.textContent = 'Удалить';
	confirmButton.className = cn(button.default, 'w-52 ml-auto');
	confirmButton.addEventListener('click', () => {
		onDelete();
		close();
	});

	const cancelButton = document.createElement('button');
	cancelButton.type = 'button';
	cancelButton.textContent = 'Отмена';
	cancelButton.className = cn(button.default, 'w-52 mr-auto bg-(--color-disabled)');
	cancelButton.addEventListener('click', close);

	buttonsRow.append(confirmButton, cancelButton);

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(question, buttonsRow);

	return overlay;
};
