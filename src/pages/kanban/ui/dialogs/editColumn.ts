import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, createSvg, customSelect, getDivider, LIMITS } from '../../lib';
import { button, layout, primitives } from '..';
import { createDialog, createSubmitButton, deleteDialog } from '.';

type EditColumnOptions = {
	mode: 'create' | 'edit';
	initial: { columnTitle: string; color: ColumnColor | undefined; limit: number | null };
	onSubmit: (columnTitle: string, color: ColumnColor, limit: number) => void;
	onDelete?: () => void;
};

type EditColumnInstance = { element: HTMLDivElement; close: () => void };

export const editColumn = (options: EditColumnOptions): EditColumnInstance => {
	const icon = createSvg(settingsIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление колонки' : 'Настройки колонки', icon);

	let isClosed = false;

	let selectedLimit = options.initial.limit ?? 10;
	let selectedColor: ColumnColor = options.initial.color ?? 'slate';
	let deleteButton: HTMLButtonElement | null = null;
	let paletteButtons: { button: HTMLButtonElement; handler: () => void }[] = [];

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'contents';

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleSubmit();
	};

	form.addEventListener('submit', onSubmit);
	overlay.addEventListener('keydown', onKeyDown);

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'mt-3 gap-3');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = 'column-title';
	labelTitle.textContent = 'Название колонки';
	labelTitle.className = primitives.label;

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initial.columnTitle;
	title.id = 'column-title';
	title.autocomplete = 'off';
	title.name = `column-title-${Math.random()}`;
	title.className = primitives.input;

	const onTitleInput = () => {
		updateSubmitState();
		updateTitleHint();
	};
	const onTitleFocus = () => updateTitleHint();
	const onTitleBlur = () => updateTitleHint();

	title.addEventListener('input', onTitleInput);
	title.addEventListener('focus', onTitleFocus);
	title.addEventListener('blur', onTitleBlur);

	const titleHint = document.createElement('span');
	titleHint.textContent = options.initial.columnTitle
		? `${title.value.length} / ${LIMITS.COLUMN_TITLE} символов`
		: `Введите название (до ${LIMITS.COLUMN_TITLE} символов)`;
	titleHint.className = cn(primitives.hint, '-mt-2');

	titleCol.append(labelTitle, title, titleHint);

	// === TASK LIMIT ===
	const limitRow = document.createElement('div');
	limitRow.className = cn(layout.row, 'justify-between');

	const labelLimitCol = document.createElement('div');
	labelLimitCol.className = cn(layout.col, 'gap-1');

	const labelLimit = document.createElement('div');
	labelLimit.textContent = 'Лимит задач';
	labelLimit.className = primitives.label;

	const limitHint = document.createElement('span');
	limitHint.textContent = 'Максимум задач в колонке';
	limitHint.className = primitives.hint;

	labelLimitCol.append(labelLimit, limitHint);

	const limitContainer = document.createElement('div');
	const customLimit = customSelect(
		{
			initialValue: options.initial.limit ?? 10,
			min: 1,
			max: 15,
			onChange: (value) => (selectedLimit = value),
		},
		'min-w-24 xl:min-w-32'
	);

	limitContainer.append(customLimit.element);

	limitRow.append(labelLimitCol, limitContainer);

	// === PALETTE ===
	const paletteCol = document.createElement('div');
	paletteCol.className = cn(layout.col, 'gap-3');

	const labelPalette = document.createElement('div');
	labelPalette.textContent = 'Цвет колонки';
	labelPalette.className = primitives.label;

	const paletteRow = document.createElement('div');
	paletteRow.className = cn(layout.row, 'gap-1 xl:gap-3');

	const currentColor = document.createElement('span');
	currentColor.textContent = '✓';
	currentColor.className =
		'pointer-events-none h-6 w-full min-w-10 cursor-default rounded-full text-center text-black select-none xl:min-w-24';
	currentColor.style.backgroundColor = COLUMN_COLORS[selectedColor];

	const paletteGrid = document.createElement('div');
	paletteGrid.className = cn(layout.row, 'flex-1 justify-between gap-1 xl:gap-3');

	Object.entries(COLUMN_COLORS).forEach(([key, color]) => {
		const colorButton = document.createElement('button');
		colorButton.type = 'button';
		colorButton.dataset.color = key;
		colorButton.className = 'size-6 cursor-pointer rounded-full transition-transform hover:scale-125';
		colorButton.style.backgroundColor = color;

		const onClick = () => selectColor(key as ColumnColor);
		colorButton.addEventListener('click', onClick);

		paletteButtons.push({ button: colorButton, handler: onClick });

		paletteGrid.append(colorButton);
	});

	paletteRow.append(currentColor, paletteGrid);

	paletteCol.append(labelPalette, paletteRow);

	// === ACTIONS ===
	const actionsCol = document.createElement('div');
	actionsCol.className = cn(layout.col, 'mx-auto gap-2');

	const submitButton = createSubmitButton(options.mode === 'create' ? 'Добавить' : 'Сохранить');

	actionsCol.append(submitButton);

	if (options.mode === 'edit' && options.onDelete) {
		deleteButton = document.createElement('button');
		deleteButton.type = 'button';
		deleteButton.textContent = 'Удалить колонку';
		deleteButton.className = cn(
			button.icon,
			'text-center text-sm text-(--status-error) opacity-70 hover:text-(--status-error) hover:opacity-100 2xl:text-base'
		);
		deleteButton.addEventListener('click', handleDelete);

		actionsCol.append(deleteButton);
	}

	// === ACTION FUNCTIONS ===
	function onKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		if (event.isComposing || event.defaultPrevented) return;
		if (submitButton.disabled) return;
		if (event.target instanceof HTMLTextAreaElement) return;

		event.preventDefault();
		form.requestSubmit();
	}

	function handleSubmit() {
		const trimmedTitle = title.value.trim();
		if (!trimmedTitle || trimmedTitle.length > LIMITS.COLUMN_TITLE) return;

		options.onSubmit(trimmedTitle, selectedColor, selectedLimit);
		close();
	}

	function handleDelete() {
		if (!options.onDelete) return;

		const confirmModal = deleteDialog(
			'Удаление колонки',
			`Вы уверены, что хотите удалить колонку <span style="color: var(--accent-default)"><strong>${options.initial.columnTitle}</strong></span>?`,
			options.onDelete
		);

		close();

		document.body.append(confirmModal.element);
	}

	function selectColor(key: ColumnColor) {
		selectedColor = key;
		currentColor.style.backgroundColor = COLUMN_COLORS[selectedColor];
	}

	function updateSubmitState() {
		const trimmedTitle = title.value.trim();
		const tooLong = trimmedTitle.length > LIMITS.COLUMN_TITLE;

		submitButton.disabled = !trimmedTitle || tooLong;
	}

	function updateTitleHint() {
		const trimmedTitle = title.value.trim();
		const length = trimmedTitle.length;
		const tooLong = trimmedTitle.length > LIMITS.COLUMN_TITLE;

		if (!trimmedTitle) titleHint.textContent = `Введите название (до ${LIMITS.COLUMN_TITLE} символов)`;
		else titleHint.textContent = `${length} / ${LIMITS.COLUMN_TITLE} символов`;

		titleHint.className = cn(primitives.hint, '-mt-2', tooLong && 'text-(--status-error)');
	}

	updateSubmitState();
	updateTitleHint();

	// === LIFECYCLE ===
	function cleanup() {
		form.removeEventListener('submit', onSubmit);
		overlay.removeEventListener('keydown', onKeyDown);

		title.removeEventListener('input', onTitleInput);
		title.removeEventListener('focus', onTitleFocus);
		title.removeEventListener('blur', onTitleBlur);
		deleteButton?.removeEventListener('click', handleDelete);
		paletteButtons.forEach(({ button, handler }) => button.removeEventListener('click', handler));

		customLimit.destroy();

		paletteButtons = [];
		deleteButton = null;
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		cleanup();
		closeDialog();
	}

	// === ASSEMBLY ===
	form.append(titleCol, divider1, limitRow, divider2, paletteCol, actionsCol);
	container.append(form);

	return { element: overlay, close };
};
