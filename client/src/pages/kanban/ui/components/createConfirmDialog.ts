import { createButton } from './createButton';
import { createDialog } from './createDialog';

type CreateConfirmDialogProps = {
	title: string;
	content: string | HTMLElement;
	icon?: SVGElement;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
};

export const createConfirmDialog = ({
	title,
	content,
	icon,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	onConfirm,
}: CreateConfirmDialogProps) => {
	let isClosed = false;

	// === DIALOG ===
	const { overlay, container, close: closeDialog } = createDialog(title, icon, cleanup);

	// === MESSAGE ===
	const message = document.createElement('div');
	message.className =
		'text-sm leading-5 wrap-break-word whitespace-normal text-(--text-secondary) select-none 2xl:text-base';

	if (typeof content === 'string') message.textContent = content;
	else message.append(content);

	// === ACTIONS ===
	const actions = document.createElement('div');
	actions.className = 'flex items-center justify-end gap-2 pt-2';

	const confirmButton = createButton({ text: confirmText, variant: 'primary', onClick: handleConfirm });

	const cancelButton = createButton({ text: cancelText, variant: 'secondary', onClick: close });

	// === ACTION FUNCTIONS ===
	function handleConfirm() {
		if (isClosed) return;

		close();
		onConfirm();
	}

	// === LIFECYCLE ===
	function cleanup() {
		if (isClosed) return;
		isClosed = true;

		confirmButton.removeEventListener('click', handleConfirm);
		cancelButton.removeEventListener('click', close);
	}

	function close() {
		closeDialog();
	}

	// === ASSEMBLY ===
	actions.append(confirmButton, cancelButton);

	container.append(message, actions);

	return { element: overlay, close };
};
