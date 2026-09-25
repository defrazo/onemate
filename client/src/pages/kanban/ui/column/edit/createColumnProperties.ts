import { limitIcon, paletteIcon } from '../../../lib';
import { COLUMN_COLORS, type ColumnColor } from '../../../model';
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
	let selectedLimit = initialLimit ?? 10;

	const paletteListeners: Array<{ button: HTMLButtonElement; handler: () => void }> = [];

	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-xl border border-(--border-color) bg-white/2';

	// === LIMIT ===
	const limitRow = createPropertyRow(limitIcon, 'Лимит задач');

	const limitSelect = createSelect({
		initialValue: selectedLimit,
		min: 1,
		max: 15,
		direction: 'up',
		className: 'w-24',
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
			'relative size-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-[transform,border-color] duration-150 hover:scale-110 hover:border-white/25';

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
			button.classList.toggle('border-white/50', selected);
			button.classList.toggle('scale-110', selected);
		});
	}

	function getValue(): { color: ColumnColor; limit: number } {
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
