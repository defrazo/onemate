import { createButton, createDialog } from '.';

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
	const { overlay, container, close: closeDialog } = createDialog(title, icon);

	// === MESSAGE ===
	const message = document.createElement('div');
	message.className =
		'text-sm leading-5 wrap-break-word whitespace-normal text-(--color-secondary) select-none 2xl:text-base';

	if (typeof content === 'string') message.textContent = content;
	else message.append(content);

	// === ACTIONS ===
	const actions = document.createElement('div');
	actions.className = 'flex items-center justify-end gap-2 pt-2';

	const confirmButton = createButton({ text: confirmText, variant: 'primary', onClick: handleConfirm });

	const cancelButton = createButton({ text: cancelText, variant: 'secondary', onClick: close });

	// === ACTION FUNCTIONS ===
	function handleConfirm() {
		onConfirm();
		close();
	}

	// === LIFECYCLE ===
	function close() {
		if (isClosed) return;
		isClosed = true;

		closeDialog();
	}

	// === ASSEMBLY ===
	actions.append(confirmButton, cancelButton);

	container.append(message, actions);

	return { element: overlay, close };
};
