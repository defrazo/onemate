import { addIcon, createSvg } from '../../lib';
import { LIMITS } from '../../model';
import { createButton, createDialog } from '.';

export const createBoardDialog = ({ onSubmit }: { onSubmit: (title: string) => Promise<boolean> }) => {
	let isClosed = false;
	let saving = false;

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog('Новая доска', createSvg(addIcon, 'size-5'), cleanup);

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'flex flex-col gap-2 select-none';

	// === FIELD ===
	const field = document.createElement('div');
	field.className = 'flex flex-col gap-1';

	const label = document.createElement('label');
	label.htmlFor = 'kanban-board-title';
	label.textContent = 'Название доски';
	label.className = 'text-sm text-(--text-secondary) opacity-70';

	const input = document.createElement('input');
	input.id = 'kanban-board-title';
	input.type = 'text';
	input.maxLength = LIMITS.BOARD_TITLE;
	input.placeholder = 'Введите название доски';
	input.className =
		'w-full rounded-lg border border-(--border-contrast)/15 bg-(--tone) p-2 text-(--text-primary) transition-colors outline-none hover:border-(--accent-primary-hover)/70 focus:border-(--accent-primary) focus:text-(--text-primary)';

	const counter = document.createElement('span');
	counter.className = 'ml-auto text-xs text-(--text-secondary) opacity-70';

	field.append(label, input, counter);

	// === ACTIONS ===
	const actions = document.createElement('div');
	actions.className = 'flex items-center justify-end gap-3 pt-2';

	const submitButton = createButton({ text: 'Создать', type: 'submit', variant: 'primary' });

	const cancelButton = createButton({ text: 'Отмена', variant: 'secondary', onClick: close });

	actions.append(submitButton, cancelButton);

	// === EVENTS ===
	function updateSubmitState() {
		const length = input.value.trim().length;

		counter.textContent = length
			? `${length} / ${LIMITS.BOARD_TITLE} символов`
			: `До ${LIMITS.BOARD_TITLE} символов`;

		submitButton.disabled = saving || length === 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (isClosed || saving || !input.value.trim()) return;

		saving = true;
		input.disabled = true;
		cancelButton.disabled = true;
		updateSubmitState();

		try {
			const success = await onSubmit(input.value.trim());

			if (success && !isClosed) close();
		} finally {
			saving = false;

			if (!isClosed) {
				input.disabled = false;
				cancelButton.disabled = false;
				updateSubmitState();
			}
		}
	}

	form.addEventListener('submit', handleSubmit);
	input.addEventListener('input', updateSubmitState);

	// === LIFECYCLE ===
	function cleanup() {
		if (isClosed) return;
		isClosed = true;

		form.removeEventListener('submit', handleSubmit);
		input.removeEventListener('input', updateSubmitState);
		cancelButton.removeEventListener('click', close);
	}

	function close() {
		closeDialog();
	}

	// === INIT ===
	updateSubmitState();

	form.append(field, actions);
	container.append(form);

	queueMicrotask(() => {
		if (!isClosed && overlay.isConnected) input.focus();
	});

	return { element: overlay, close };
};
