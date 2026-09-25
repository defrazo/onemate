import { createSvg, deleteIcon, settingsIcon } from '../../../lib';
import { type ColumnColor, LIMITS } from '../../../model';
import { createButton, createConfirmDialog, createDialog } from '../../components';
import { createColumnFields, createColumnProperties } from '.';

type EditColumnProps = {
	mode: 'create' | 'edit';
	initial: { columnTitle: string; color: ColumnColor | undefined; limit: number | null };
	onSubmit: (columnTitle: string, color: ColumnColor, limit: number) => void;
	onDelete?: () => void;
};

export const editColumn = (options: EditColumnProps) => {
	let isClosed = false;

	// === DIALOG ===
	const icon = createSvg(settingsIcon, 'size-5');

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление колонки' : 'Настройки колонки', icon);

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'flex flex-col gap-2 select-none';

	// === FIELDS ===
	const fields = createColumnFields({ title: options.initial.columnTitle, onChange: updateSubmitState });

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
		const deleteButton = createButton({
			text: 'Удалить',
			variant: 'danger',
			className: 'mr-auto',
			onClick: handleDelete,
		});

		actions.prepend(deleteButton);
	}

	// === EVENTS ===
	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleSubmit();
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		if (event.isComposing) return;
		if (event.defaultPrevented) return;
		if (submitButton.disabled) return;

		event.preventDefault();
		form.requestSubmit();
	};

	form.addEventListener('submit', onSubmit);
	overlay.addEventListener('keydown', onKeyDown);

	// === ACTION FUNCTIONS ===
	function handleSubmit() {
		const title = fields.getTitle();
		const { color, limit } = properties.getValue();

		if (!title) return;

		if (title.length > LIMITS.COLUMN_TITLE) return;

		options.onSubmit(title, color, limit);

		close();
	}

	function handleDelete() {
		if (!options.onDelete) return;

		const content = document.createElement('span');
		content.append('Вы уверены, что хотите удалить колонку ');

		const columnTitle = document.createElement('strong');
		columnTitle.textContent = options.initial.columnTitle;
		columnTitle.className = 'text-(--accent-default)';

		content.append(columnTitle, '?');

		const confirmModal = createConfirmDialog({
			title: 'Удаление колонки',
			content,
			icon: createSvg(deleteIcon, 'size-5'),
			confirmText: 'Удалить',
			onConfirm: () => options.onDelete?.(),
		});

		close();

		document.body.append(confirmModal.element);
	}

	function updateSubmitState() {
		const title = fields.getTitle();

		submitButton.disabled = !title || title.length > LIMITS.COLUMN_TITLE;
	}

	// === LIFECYCLE ===
	function cleanup() {
		form.removeEventListener('submit', onSubmit);
		overlay.removeEventListener('keydown', onKeyDown);

		fields.destroy();
		properties.destroy();
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		cleanup();
		closeDialog();
	}

	// === INIT ===
	updateSubmitState();

	// === ASSEMBLY ===
	form.append(fields.element, properties.element, actions);

	container.append(form);

	return { element: overlay, close };
};
