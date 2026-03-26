import dateIcon from '@/shared/assets/icons/system/date.svg?raw';
import { cn } from '@/shared/lib/utils';

import { layout, primitives } from '../ui';
import { insertSvg } from './utils';

// === SELECT ===
type CustomSelectItem<T extends string | number = string | number> = { value: T; label: string };

type CustomSelectOptions<T extends string | number = number> = {
	initialValue?: T;
	items?: T[] | CustomSelectItem<T>[];
	min?: number;
	max?: number;
	onChange?: (value: T) => void;
};

export const customSelect = <T extends string | number = number>(
	options: CustomSelectOptions<T> = {},
	className?: string
): HTMLDivElement => {
	const container = document.createElement('div');
	container.className = cn('relative inline-block min-w-fit text-center cursor-pointer select-none', className);

	let items: Array<T | CustomSelectItem<T>> = [];

	if (options.items) {
		items = options.items;
	} else if (typeof options.min === 'number' && typeof options.max === 'number') {
		for (let i = options.min; i <= options.max; i++) items.push(i as T);
	} else items = [options.initialValue ?? 0] as Array<T>;

	const initialItem = options.initialValue ?? items[0];

	const findLabel = (value: T): string => {
		const found = items.find((item) =>
			typeof item === 'object' && 'value' in item ? item.value === value : item === value
		);
		if (found && typeof found === 'object' && 'label' in found) return found.label;
		return String(value);
	};

	const selected = document.createElement('div');
	selected.className =
		'border border-(--border-color) flex-1 hover:border-(--accent-hover) rounded-xl p-1 bg-(--bg-tertiary)/50 flex justify-between items-center';

	const selectedValue = document.createElement('span');
	selectedValue.textContent = findLabel(initialItem as T);
	selectedValue.className = 'flex-1 px-2';

	const arrow = document.createElement('span');
	arrow.className = 'arrow ml-2';
	arrow.innerHTML = '&#9662;';

	selected.append(selectedValue, arrow);

	const optionsContainer = document.createElement('div');
	optionsContainer.dataset.customSelect = '';
	optionsContainer.className =
		'absolute left-0 right-0 mt-1 hide-scrollbar border border-(--border-color) rounded-xl bg-(--bg-tertiary) shadow-(--shadow) hidden max-h-40 overflow-auto z-10';

	items.forEach((item) => {
		let displayText: string;
		let value: T;

		if (typeof item === 'object' && 'value' in item && 'label' in item) {
			displayText = item.label;
			value = item.value;
		} else {
			displayText = String(item);
			value = item as T;
		}

		const option = document.createElement('div');
		option.className = 'p-1 hover:bg-(--accent-hover) hover:cursor-pointer hover:text-(--accent-text)';
		option.textContent = displayText;

		option.addEventListener('click', () => {
			selectedValue.textContent = displayText;
			optionsContainer.classList.add('hidden');
			options.onChange?.(value);
		});

		optionsContainer.appendChild(option);
	});

	selected.addEventListener('click', (event) => {
		event.stopPropagation();
		closeAllSelects(optionsContainer);
		optionsContainer.classList.toggle('hidden');
	});

	container.append(selected, optionsContainer);

	document.addEventListener('click', (event) => {
		if (!container.contains(event.target as Node)) optionsContainer.classList.add('hidden');
	});

	const closeAllSelects = (except?: HTMLElement) => {
		document.querySelectorAll('[data-custom-select]').forEach((element) => {
			if (element !== except) element.classList.add('hidden');
		});
	};

	return container;
};

// === DATE PICKER ===
export const customDatePicker = (date: string | null, className?: string, readonly?: 'readonly' | null) => {
	const isReadonly = readonly === 'readonly';

	const container = document.createElement('div');
	container.className = cn(
		layout.row,
		primitives.input,
		'relative',
		isReadonly ? 'cursor-default hover:border-(--border-color)' : 'cursor-pointer',
		className
	);

	const icon = document.createElement('span');
	insertSvg(icon, dateIcon, 'size-5');

	const input = document.createElement('input');
	input.type = 'date';
	input.value = date || '';
	input.readOnly = isReadonly;
	input.className = 'absolute right-0 opacity-0 pointer-events-none';

	const display = document.createElement('div');
	display.textContent = date ? formatDate(date) : 'дд.мм.гггг';
	display.className = 'mx-auto';

	container.append(icon, display, input);

	if (!isReadonly) {
		container.addEventListener('click', () => input.showPicker?.());
		input.addEventListener('change', () => (display.textContent = formatDate(input.value)));
	}

	return { element: container, getValue: () => input.value };

	function formatDate(iso: string) {
		if (!iso) return 'дд.мм.гггг';
		const [y, m, d] = iso.split('-');
		return `${d}.${m}.${y}`;
	}
};
