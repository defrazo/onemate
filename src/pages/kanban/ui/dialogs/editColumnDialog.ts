import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, createSvg, customSelect, getDivider, LIMITS } from '../../lib';
import { button, layout, primitives } from '../styles';
import { createDialog, deleteDialog } from '.';

type EditColumnDialogOptions = {
	mode: 'create' | 'edit';
	initialData: { columnName: string; limit: number | null; color?: ColumnColor };
	onSubmit: (columnName: string, limit: number, color: ColumnColor) => void;
	onDelete?: () => void;
};

export const editColumnDialog = (options: EditColumnDialogOptions): HTMLElement => {
	const icon = createSvg(settingsIcon, 'size-5');
	const divider1 = getDivider();
	const divider2 = getDivider();

	const { overlay, container, close } = createDialog(
		options.mode === 'create' ? 'Добавление колонки' : 'Настройки колонки',
		icon
	);

	let selectedLimit = options.initialData.limit ?? 10;
	let selectedColor: ColumnColor = options.initialData.color ?? 'slate';

	// === TITLE ===
	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-3 mt-3');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = 'column-title';
	labelTitle.textContent = 'Название колонки';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initialData.columnName;
	title.id = 'column-title';
	title.autocomplete = 'off';
	title.name = `column-title-${Math.random()}`;
	title.className = primitives.input;
	title.addEventListener('input', () => {
		updateSubmitState();
		updateTitleHint('focus');
	});
	title.addEventListener('focus', () => updateTitleHint('focus'));
	title.addEventListener('blur', () => updateTitleHint('blur'));

	const titleHint = document.createElement('span');
	titleHint.textContent = options.initialData.columnName
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
	labelLimit.className = 'leading-4 select-none';

	const limitHint = document.createElement('span');
	limitHint.textContent = 'Максимум задач в колонке';
	limitHint.className = primitives.hint;

	labelLimitCol.append(labelLimit, limitHint);

	const limitContainer = document.createElement('div');
	const customLimit = customSelect(
		{
			initialValue: options.initialData.limit || 10,
			min: 1,
			max: 15,
			onChange: (value) => (selectedLimit = value),
		},
		'min-w-24 xl:min-w-32'
	);

	limitContainer.append(customLimit);

	limitRow.append(labelLimitCol, limitContainer);

	// === PALETTE ===
	const paletteCol = document.createElement('div');
	paletteCol.className = cn(layout.col, 'gap-3');

	const labelPalette = document.createElement('div');
	labelPalette.textContent = 'Цвет колонки';
	labelPalette.className = 'leading-4 select-none';

	const paletteRow = document.createElement('div');
	paletteRow.className = cn(layout.row, 'gap-1 xl:gap-3');

	const currentColor = document.createElement('span');
	currentColor.textContent = '✓';
	currentColor.className = cn(
		'h-6 min-w-10 xl:min-w-24 w-full select-none text-black text-center rounded-full cursor-default pointer-events-none transition-transform'
	);
	currentColor.style.backgroundColor = COLUMN_COLORS[selectedColor];

	const paletteGrid = document.createElement('div');
	paletteGrid.className = cn(layout.row, 'flex-1 gap-1 xl:gap-3 justify-between');

	Object.entries(COLUMN_COLORS).forEach(([key, hex]) => {
		const colorButton = document.createElement('button');
		colorButton.type = 'button';
		colorButton.dataset.color = key;
		colorButton.className = cn('size-6 rounded-full cursor-pointer hover:scale-125 transition-transform');
		colorButton.style.backgroundColor = hex;

		colorButton.addEventListener('click', () => {
			selectedColor = key as ColumnColor;
			currentColor.style.backgroundColor = COLUMN_COLORS[selectedColor];
		});

		paletteGrid.append(colorButton);
	});

	paletteRow.append(currentColor, paletteGrid);

	paletteCol.append(labelPalette, paletteRow);

	// === ACTIONS ===
	const actionsCol = document.createElement('div');
	actionsCol.className = cn(layout.col, 'gap-2 mx-auto');

	const submitButton = document.createElement('button');
	submitButton.type = 'button';
	submitButton.textContent = 'Сохранить';
	submitButton.className = cn(button.default, 'w-52 mt-3');
	submitButton.addEventListener('click', () => handleSubmit());

	actionsCol.append(submitButton);

	if (options.mode === 'edit' && options.onDelete) {
		const deleteLink = document.createElement('a');
		deleteLink.type = 'button';
		deleteLink.textContent = 'Удалить колонку';
		deleteLink.className = cn(
			button.icon,
			'text-center hover:text-(--status-error) opacity-70 text-(--status-error) hover:opacity-100'
		);
		deleteLink.addEventListener('click', () => handleDelete());

		actionsCol.append(deleteLink);
	}

	// === ACTION FUNCTIONS ===
	const handleSubmit = () => {
		if (!title.value.trim()) return;

		options.onSubmit(title.value.trim(), selectedLimit, selectedColor);
		close();
	};

	const updateSubmitState = () => {
		const tooLong = title.value.trim().length > LIMITS.COLUMN_TITLE;
		submitButton.disabled = !title.value.trim() || tooLong;
	};

	const updateTitleHint = (event: 'focus' | 'blur') => {
		const length = title.value.length;

		if (event === 'focus' && length >= 1) {
			titleHint.textContent = `${length} / ${LIMITS.COLUMN_TITLE} символов`;
			titleHint.className = cn(primitives.hint, '-mt-2', length > LIMITS.COLUMN_TITLE && 'text-red-500');
		} else if (!title.value.trim()) titleHint.textContent = `Введите название (до ${LIMITS.COLUMN_TITLE} символов)`;
	};

	const handleDelete = () => {
		close();
		const modal = deleteDialog('Удаление колонки', 'Вы уверены, что хотите удалить колонку?', options.onDelete!);

		document.body.append(modal);
	};

	updateSubmitState();

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(titleCol, divider1, limitRow, divider2, paletteCol, actionsCol);

	return overlay;
};
