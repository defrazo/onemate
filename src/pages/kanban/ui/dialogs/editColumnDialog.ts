import settingsIcon from '@/shared/assets/icons/actions/settings.svg?raw';
import { cn } from '@/shared/lib/utils';

import { COLUMN_COLORS, type ColumnColor, createCustomSelect, createSvg, generateId, getDivider } from '../../lib';
import { button, layout, primitives } from '../styles';
import { createDialog, deleteDialog } from '.';

type EditColumnDialogOptions = {
	mode: 'create' | 'edit';
	initialData: {
		columnName: string;
		limit: number | null;
		color?: ColumnColor;
	};

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
	const titleId = generateId('column-title');

	const titleCol = document.createElement('div');
	titleCol.className = cn(layout.col, 'gap-3 mt-3');

	const labelTitle = document.createElement('label');
	labelTitle.htmlFor = titleId;
	labelTitle.textContent = 'Название колонки';
	labelTitle.className = 'leading-4 select-none';

	const title = document.createElement('input');
	title.type = 'text';
	title.value = options.initialData.columnName;
	title.id = titleId;
	title.className = primitives.input;
	title.addEventListener('input', () => updateSubmitState());

	const titleHint = document.createElement('span');
	titleHint.textContent = 'Введите название';
	titleHint.className = cn(primitives.hint, '-mt-2');

	titleCol.append(labelTitle, title, titleHint);

	// === TASK LIMIT ===
	const limitId = generateId('column-limit');

	const limitRow = document.createElement('div');
	limitRow.className = cn(layout.row, 'justify-between');

	const labelLimitCol = document.createElement('div');
	labelLimitCol.className = cn(layout.col, 'gap-1');

	const labelLimit = document.createElement('label');
	labelLimit.htmlFor = limitId;
	labelLimit.textContent = 'Лимит задач';
	labelLimit.className = 'leading-4 select-none';

	const limitHint = document.createElement('span');
	limitHint.textContent = 'Максимум задач в колонке';
	limitHint.className = primitives.hint;

	labelLimitCol.append(labelLimit, limitHint);

	const limitContainer = document.createElement('div');
	limitContainer.id = limitId;

	const customLimit = createCustomSelect(
		{
			initialValue: options.initialData.limit || 10,
			min: 1,
			max: 15,
			onChange: (value) => (selectedLimit = value),
		},
		'min-w-32'
	);

	limitContainer.append(customLimit);

	limitRow.append(labelLimitCol, limitContainer);

	// === PALETTE ===
	const paletteCol = document.createElement('div');
	paletteCol.className = cn(layout.col, 'gap-3');

	const labelPalette = document.createElement('label');
	labelPalette.textContent = 'Цвет колонки';
	labelPalette.className = 'leading-4 select-none';

	const paletteRow = document.createElement('div');
	paletteRow.className = cn(layout.row, 'gap-3');

	const currentColor = document.createElement('span');
	currentColor.textContent = '✓';
	currentColor.className = cn(
		'h-6 min-w-24 w-full select-none text-black text-center rounded-full cursor-default pointer-events-none transition-transform'
	);
	currentColor.style.backgroundColor = COLUMN_COLORS[selectedColor];

	const paletteGrid = document.createElement('div');
	paletteGrid.className = cn(layout.row, 'flex-1 gap-3 justify-between');

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

	const updateSubmitState = () => (submitButton.disabled = !title.value.trim());

	const handleDelete = () => {
		close();
		const modal = deleteDialog('Удаление колонки', 'Вы уверены, что хотите удалить колонку?', options.onDelete!);

		document.body.append(modal);
	};

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(titleCol, divider1, limitRow, divider2, paletteCol, actionsCol);

	updateSubmitState();

	return overlay;
};
