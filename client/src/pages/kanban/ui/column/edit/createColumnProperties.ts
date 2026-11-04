import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Switch } from '@/shared/ui';

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
	let selectedLimit: number | null = initialLimit;
	let lastNumericLimit = initialLimit ?? 10;

	const paletteListeners: Array<{ button: HTMLButtonElement; handler: () => void }> = [];

	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col rounded-lg border border-(--border-primary) bg-(--tone)';

	// === LIMIT ===
	const limitRow = createPropertyRow(limitIcon, 'Лимит задач');

	const limitOptions: { value: number; label: string }[] = Array.from({ length: 15 }, (_, index) => ({
		value: index + 1,
		label: String(index + 1),
	}));

	if (!limitOptions.some((option) => option.value === lastNumericLimit))
		limitOptions.push({ value: lastNumericLimit, label: String(lastNumericLimit) });

	const limitSelect = createSelect<number>({
		initialValue: lastNumericLimit,
		items: limitOptions,
		direction: 'up',
		className: 'w-24',
		onChange: (value) => {
			lastNumericLimit = value;
			if (selectedLimit !== null) selectedLimit = value;
			onChange();
		},
	});

	const unlimitedLabel = document.createElement('span');
	unlimitedLabel.textContent = 'Без лимита';
	unlimitedLabel.className = 'text-sm text-(--text-secondary)';
	const switchContainer = document.createElement('div');
	switchContainer.setAttribute('role', 'group');
	switchContainer.setAttribute('aria-label', 'Лимит задач');
	const switchRoot = createRoot(switchContainer);
	limitRow.content.classList.add('gap-2');
	limitRow.content.append(unlimitedLabel, limitSelect.element, switchContainer);

	function updateLimitControls() {
		const enabled = selectedLimit !== null;
		unlimitedLabel.classList.toggle('hidden', enabled);
		limitSelect.element.classList.toggle('hidden', !enabled);
		switchRoot.render(
			createElement(Switch, {
				checked: enabled,
				onCheckedChange: (checked) => {
					selectedLimit = checked ? lastNumericLimit : null;
					updateLimitControls();
					onChange();
				},
			})
		);
	}
	updateLimitControls();

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
		switchRoot.unmount();
		limitSelect.destroy();

		paletteListeners.forEach(({ button, handler }) => button.removeEventListener('click', handler));
	}

	// === INIT ===
	updatePalette();

	// === ASSEMBLY ===
	element.append(limitRow.element, colorRow.element);

	return { element, getValue, destroy };
};
