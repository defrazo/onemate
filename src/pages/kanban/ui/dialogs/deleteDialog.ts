import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import { cn } from '@/shared/lib/utils';

import { createSvg } from '../../lib';
import { layout } from '..';
import { createDialog, createSubmitButton } from '.';

export const deleteDialog = (title: string, content: string, onDelete: () => void): HTMLElement => {
	const icon = createSvg(deleteIcon, 'size-5');

	const { overlay, container, close } = createDialog(title, icon);

	// === QUESTION TEXT ===
	const question = document.createElement('span');
	question.textContent = content;
	question.className = 'text-md pt-5 pb-1 select-none text-center';

	// === BUTTONS ROW ===
	const buttonsRow = document.createElement('div');
	buttonsRow.className = cn(layout.row, 'gap-4');

	const confirmButton = createSubmitButton('Удалить', handleSubmit);
	const cancelButton = createSubmitButton('Отмена', close, 'bg-(--color-disabled)');

	buttonsRow.append(confirmButton, cancelButton);

	// === ACTION FUNCTIONS ===
	function handleSubmit() {
		onDelete();
		close();
	}

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(question, buttonsRow);

	return overlay;
};
