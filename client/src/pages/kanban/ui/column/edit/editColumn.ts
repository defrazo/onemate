import { deleteIcon, settingsIcon } from '../../../lib/icons';
import { notifier } from '../../../lib/notifier';
import { createSvg } from '../../../lib/utils';
import { LIMITS } from '../../../model/constants';
import type { ColumnColor } from '../../../model/types';
import { createButton, createConfirmDialog, createDialog } from '../../components';
import { createColumnDetails } from './createColumnDetails';
import { createColumnProperties } from './createColumnProperties';

type EditColumnProps = {
	mode: 'create' | 'edit';
	initial: { columnTitle: string; color: ColumnColor | undefined; limit: number | null };
	onSubmit: (
		columnTitle: string,
		color: ColumnColor,
		limit: number | null
	) => void | boolean | Promise<void | boolean>;
	onClose?: () => void;
	onDelete?: () => void;
};

export const editColumn = (options: EditColumnProps) => {
	let isClosed = false;
	let saving = false;
	let confirmModal: ReturnType<typeof createConfirmDialog> | null = null;
	let deleteButton: HTMLButtonElement | undefined;

	// === DIALOG ===
	const icon = createSvg(settingsIcon, 'size-5');

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление колонки' : 'Настройки колонки', icon, cleanup);

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'flex flex-col gap-2 select-none';

	// === FIELDS ===
	const fields = createColumnDetails({ title: options.initial.columnTitle, onChange: updateSubmitState });

	// === PROPERTIES ===
	const properties = createColumnProperties({
		color: options.initial.color,
		limit: options.initial.limit,
		onChange: updateSubmitState,
	});

	// === ACTIONS ===
	const actions = document.createElement('div');
	actions.className = 'flex items-center justify-end gap-3 pt-2';

	const submitButton = createButton({
		text: options.mode === 'create' ? 'Добавить' : 'Сохранить',
		type: 'submit',
		variant: 'primary',
	});

	const cancelButton = createButton({ text: 'Отмена', variant: 'secondary', onClick: close });

	actions.append(submitButton, cancelButton);

	// === DELETE ===
	if (options.mode === 'edit' && options.onDelete) {
		deleteButton = createButton({
			text: 'Удалить',
			variant: 'danger',
			className: 'mr-auto',
			onClick: handleDelete,
		});

		actions.prepend(deleteButton);
	}

	// === EVENTS ===
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		handleSubmit();
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		if (e.isComposing) return;
		if (e.defaultPrevented) return;
		if (submitButton.disabled) return;

		e.preventDefault();
		form.requestSubmit();
	};

	form.addEventListener('submit', onSubmit);
	overlay.addEventListener('keydown', onKeyDown);

	// === ACTION FUNCTIONS ===
	async function handleSubmit() {
		if (isClosed || saving) return;

		const title = fields.getTitle();
		const { color, limit } = properties.getValue();

		if (!title) return;

		if (title.length > LIMITS.COLUMN_TITLE) return;

		saving = true;
		form.inert = true;

		updateSubmitState();

		try {
			if ((await options.onSubmit(title, color, limit)) !== false && !isClosed) close();
		} catch {
			if (!isClosed) notifier.setNotice('Не удалось сохранить колонку', 'error');
		} finally {
			saving = false;

			if (!isClosed) {
				form.inert = false;
				updateSubmitState();
			}
		}
	}

	function handleDelete() {
		if (isClosed || !options.onDelete) return;

		const content = document.createElement('span');
		content.append('Вы уверены, что хотите удалить колонку ');

		const columnTitle = document.createElement('strong');
		columnTitle.textContent = options.initial.columnTitle;
		columnTitle.className = 'text-(--accent-primary)';

		content.append(columnTitle, '?');

		confirmModal = createConfirmDialog({
			title: 'Удаление колонки',
			content,
			icon: createSvg(deleteIcon, 'size-5'),
			confirmText: 'Удалить',
			onConfirm: () => options.onDelete?.(),
		});

		closeDialog();

		document.body.append(confirmModal.element);
	}

	function updateSubmitState() {
		const title = fields.getTitle();
		submitButton.disabled = saving || !title || title.length > LIMITS.COLUMN_TITLE;
	}

	// === LIFECYCLE ===
	function cleanup() {
		if (isClosed) return;
		isClosed = true;

		form.removeEventListener('submit', onSubmit);
		overlay.removeEventListener('keydown', onKeyDown);
		cancelButton.removeEventListener('click', close);
		deleteButton?.removeEventListener('click', handleDelete);

		fields.destroy();
		properties.destroy();
		options.onClose?.();
	}

	function close() {
		confirmModal?.close();
		confirmModal = null;
		closeDialog();
	}

	// === INIT ===
	updateSubmitState();

	// === ASSEMBLY ===
	form.append(fields.element, properties.element, actions);

	container.append(form);

	return { element: overlay, close };
};
