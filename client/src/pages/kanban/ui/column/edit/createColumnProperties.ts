import { limitIcon, paletteIcon } from '../../../lib/icons';
import { COLUMN_COLORS } from '../../../model/constants';
import type { ColumnColor } from '../../../model/types';
import { createPropertyRow, createSelect } from '../../components';

type CreateColumnPropertiesProps = {
	color?: ColumnColor;
	limit: number | null;
	onChange: () => void;
};

export const createColumnProperties = ({
	color: initialColor,
	limit: initialLimit,
	onChange,
}: CreateColumnPropertiesProps) => {
	let selectedColor: ColumnColor = initialColor ?? 'slate';
	let selectedLimit: number | null = initialLimit;

	const paletteListeners: Array<{ button: HTMLButtonElement; handler: () => void }> = [];

	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-lg border border-(--border-primary) bg-(--tone)';

	// === LIMIT ===
	const limitRow = createPropertyRow(limitIcon, 'Лимит задач');

	const limitOptions: { value: number | null; label: string }[] = [
		{ value: null, label: 'Не задан' },
		...Array.from({ length: 15 }, (_, idx) => ({ value: idx + 1, label: String(idx + 1) })),
	];

	if (initialLimit !== null && !limitOptions.some((option) => option.value === initialLimit))
		limitOptions.push({ value: initialLimit, label: String(initialLimit) });

	const limitSelect = createSelect<number | null>({
		initialValue: initialLimit,
		items: limitOptions,
		direction: 'up',
		className: 'w-32',
		onChange: (value) => {
			selectedLimit = value;
			onChange();
		},
	});

	limitRow.content.append(limitSelect.element);

	// === COLOR ===
	const colorRow = createPropertyRow(paletteIcon, 'Цвет');

	const palette = document.createElement('div');
	palette.className = 'flex items-center gap-1.5';

	Object.entries(COLUMN_COLORS).forEach(([key, color]) => {
		const columnColor = key as ColumnColor;

		const button = document.createElement('button');
		button.type = 'button';
		button.title = columnColor;
		button.dataset.color = columnColor;
		button.className =
			'relative size-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-[transform,border-color] duration-150 hover:scale-110 hover:border-(--tone-strong-hover)';

		const dot = document.createElement('span');
		dot.className = 'absolute inset-0.5 rounded-full';
		dot.style.backgroundColor = color;

		const handler = () => selectColor(columnColor);

		button.addEventListener('click', handler);
		paletteListeners.push({ button, handler });

		button.append(dot);
		palette.append(button);
	});

	colorRow.content.append(palette);

	// === ACTION FUNCTIONS ===
	function selectColor(color: ColumnColor) {
		selectedColor = color;
		updatePalette();
		onChange();
	}

	function updatePalette() {
		paletteListeners.forEach(({ button }) => {
			const selected = button.dataset.color === selectedColor;

			button.classList.toggle('border-(--tone-strong-hover)', selected);
			button.classList.toggle('border-transparent', !selected);
			button.classList.toggle('scale-110', selected);
		});
	}

	function getValue(): { color: ColumnColor; limit: number | null } {
		return { color: selectedColor, limit: selectedLimit };
	}

	// === LIFECYCLE ===
	function destroy() {
		limitSelect.destroy();

		paletteListeners.forEach(({ button, handler }) => button.removeEventListener('click', handler));
	}

	// === INIT ===
	updatePalette();

	// === ASSEMBLY ===
	element.append(limitRow.element, colorRow.element);

	return { element, getValue, destroy };
};
