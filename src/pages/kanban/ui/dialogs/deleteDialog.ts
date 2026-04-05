import deleteIcon from '@/shared/assets/icons/actions/trash.svg?raw';
import { cn } from '@/shared/lib/utils';

import { createSvg } from '../../lib';
import { layout } from '..';
import { createDialog, createSubmitButton } from '.';

type DeleteInstance = { element: HTMLDivElement; close: () => void };

export const deleteDialog = (title: string, content: string, onDelete: () => void): DeleteInstance => {
	const icon = createSvg(deleteIcon, 'size-5');

	const { overlay, container, close: closeDialog } = createDialog(title, icon);

	let isClosed = false;

	// === QUESTION TEXT ===
	const question = document.createElement('span');
	question.innerHTML = content;
	question.className = 'pt-5 pb-1 text-center text-sm select-none break-words whitespace-normal 2xl:text-base';

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

	function close() {
		if (isClosed) return;
		isClosed = true;

		closeDialog();
	}

	// === ASSEMBLY ===
	container.append(question, buttonsRow);

	return { element: overlay, close };
};
