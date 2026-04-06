import dateIcon from '@/shared/assets/icons/system/date.svg?raw';
import { cn } from '@/shared/lib/utils';

import { border, layout, primitives } from '../ui';
import { insertSvg } from '.';

// === DIVIDER ===
export const getDivider = (className = '') => {
	const divider = document.createElement('div');
	divider.className = cn('w-full border-b border-(--border-color)', className);
	return divider;
};

// === SELECT ===
type CustomSelectItem<T extends string | number = string | number> = { value: T; label: string };

type CustomSelectOptions<T extends string | number = number> = {
	initialValue?: T;
	items?: T[] | CustomSelectItem<T>[];
	min?: number;
	max?: number;
	onChange?: (value: T) => void;
	direction?: 'up' | 'down';
};

type CustomSelectInstance = { element: HTMLDivElement; destroy: () => void };

export const customSelect = <T extends string | number = number>(
	options: CustomSelectOptions<T> = {},
	className?: string
): CustomSelectInstance => {
	const container = document.createElement('div');
	container.className = cn(
		'relative inline-block min-w-fit cursor-pointer text-center text-base select-none xl:text-sm 2xl:text-base',
		className
	);

	let items: Array<T | CustomSelectItem<T>> = [];

	if (options.items) items = options.items;
	else if (typeof options.min === 'number' && typeof options.max === 'number')
		for (let i = options.min; i <= options.max; i++) items.push(i as T);
	else items = [options.initialValue ?? 0] as Array<T>;

	const initialItem = options.initialValue ?? items[0];

	const findLabel = (value: T): string => {
		const found = items.find((item) =>
			typeof item === 'object' && 'value' in item ? item.value === value : item === value
		);
		if (found && typeof found === 'object' && 'label' in found) return found.label;
		return String(value);
	};

	const selected = document.createElement('div');
	selected.className = cn(
		layout.row,
		border.default,
		'flex-1 justify-between rounded-xl bg-(--bg-tertiary)/50 p-1 hover:border-(--accent-hover)'
	);

	const selectedValue = document.createElement('span');
	selectedValue.textContent = findLabel(initialItem as T);
	selectedValue.className = 'flex-1 px-2';

	const arrow = document.createElement('span');
	arrow.className = 'ml-2';
	arrow.innerHTML = '&#9662;';

	selected.append(selectedValue, arrow);

	const optionsContainer = document.createElement('div');
	optionsContainer.dataset.customSelect = '';
	optionsContainer.className = cn(
		border.default,
		'hide-scrollbar absolute right-0 left-0 z-10 hidden max-h-36 overflow-auto rounded-xl bg-(--bg-tertiary) shadow-(--shadow)',
		options.direction === 'up' ? 'mb-0.5' : 'mt-0.5'
	);

	const optionListeners: Array<{ element: HTMLDivElement; handler: () => void }> = [];

	const closeAllSelects = (except?: HTMLElement) => {
		document.querySelectorAll('[data-custom-select]').forEach((element) => {
			if (element !== except) element.classList.add('hidden');
		});
	};

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
		option.className = 'p-1 hover:cursor-pointer hover:bg-(--accent-hover) hover:text-(--accent-text)';
		option.textContent = displayText;

		const onOptionClick = () => {
			selectedValue.textContent = displayText;
			optionsContainer.classList.add('hidden');
			options.onChange?.(value);
		};

		option.addEventListener('click', onOptionClick);
		optionListeners.push({ element: option, handler: onOptionClick });

		optionsContainer.appendChild(option);
	});

	const onSelectedClick = (event: MouseEvent) => {
		event.stopPropagation();
		closeAllSelects(optionsContainer);

		optionsContainer.classList.toggle('hidden');

		if (options.direction === 'up') {
			optionsContainer.style.top = 'auto';
			optionsContainer.style.bottom = `${selected.offsetHeight}px`;
		} else {
			optionsContainer.style.top = `${selected.offsetHeight}px`;
			optionsContainer.style.bottom = 'auto';
		}
	};

	const onDocumentClick = (event: MouseEvent) => {
		if (!container.contains(event.target as Node)) {
			optionsContainer.classList.add('hidden');
		}
	};

	selected.addEventListener('click', onSelectedClick);
	document.addEventListener('click', onDocumentClick);

	container.append(selected, optionsContainer);

	const destroy = () => {
		selected.removeEventListener('click', onSelectedClick);
		document.removeEventListener('click', onDocumentClick);

		optionListeners.forEach(({ element, handler }) => {
			element.removeEventListener('click', handler);
		});
	};

	return { element: container, destroy };
};

// === DATE PICKER ===
export const customDatePicker = (date: string | null, className?: string, readonly?: 'readonly' | null) => {
	const isReadonly = readonly === 'readonly';

	const container = document.createElement('div');
	container.className = cn(
		layout.row,
		primitives.input,
		'relative',
		isReadonly && 'hover:border-(--border-color)',
		className
	);

	const icon = document.createElement('span');
	insertSvg(icon, dateIcon, 'size-5 mr-1');

	const input = document.createElement('input');
	input.type = 'date';
	input.value = date || '';
	input.readOnly = isReadonly;
	input.className = cn(
		'absolute inset-0 w-[120%] pr-3 opacity-0',
		isReadonly ? 'pointer-events-none cursor-default' : 'cursor-pointer'
	);

	const display = document.createElement('div');
	display.textContent = date ? formatDate(date) : 'дд.мм.гггг';
	display.className = 'mx-auto';

	container.append(display, input, icon);

	if (!isReadonly) {
		container.addEventListener('click', () => input.showPicker?.());
		input.addEventListener('change', () => {
			display.textContent = formatDate(input.value);
			container.dispatchEvent(new CustomEvent('dateChange', { detail: input.value }));
		});
	}

	return { element: container, getValue: () => input.value };

	function formatDate(iso: string) {
		if (!iso) return 'дд.мм.гггг';
		const [y, m, d] = iso.split('-');
		return `${d}.${m}.${y}`;
	}
};
