import { cn } from '@/shared/lib/utils';

import { chevronDownIcon, insertSvg } from '../../lib';

type SelectValue = string | number;

type SelectItem<T extends SelectValue> = { value: T; label: string };

type CreateSelectOptions<T extends SelectValue> = {
	initialValue?: T;
	items?: T[] | SelectItem<T>[];
	min?: number;
	max?: number;
	direction?: 'up' | 'down';
	className?: string;
	onChange?: (value: T) => void;
};

export const createSelect = <T extends SelectValue = number>(options: CreateSelectOptions<T> = {}) => {
	const items = createItems(options);
	const initialValue = options.initialValue ?? getItemValue(items[0]);

	let currentValue = initialValue;

	// === CONTAINER ===
	const container = document.createElement('div');
	container.className = cn('relative inline-block min-w-fit select-none text-sm', options.className);

	// === TRIGGER ===
	const selected = document.createElement('button');
	selected.type = 'button';
	selected.className =
		'flex w-full min-w-0 cursor-pointer items-center justify-between rounded-lg border border-(--border-color) bg-white/3 px-2.5 py-2 text-left text-(--color-primary) transition-colors hover:border-white/15 hover:bg-white/5 focus-visible:border-(--accent-default) focus-visible:outline-none';

	const selectedValue = document.createElement('span');
	selectedValue.textContent = findLabel(currentValue);
	selectedValue.className = 'min-w-0 flex-1 truncate text-center';

	const arrow = document.createElement('div');
	arrow.className =
		'flex size-4 shrink-0 items-center justify-center text-(--color-disabled) transition-transform duration-200';
	insertSvg(arrow, chevronDownIcon, 'size-3.5');

	selected.append(selectedValue, arrow);

	// === OPTIONS ===
	const optionsContainer = document.createElement('div');
	optionsContainer.dataset.customSelect = '';
	optionsContainer.className = cn(
		'hide-scrollbar absolute right-0 left-0 z-30 hidden max-h-36 overflow-y-auto rounded-lg border border-(--border-color) bg-(--bg-secondary) p-1 shadow-(--shadow)',
		options.direction === 'up' ? 'mb-1' : 'mt-1'
	);

	const optionElements = new Map<T, HTMLButtonElement>();
	const optionListeners: Array<{ element: HTMLButtonElement; handler: () => void }> = [];

	for (const item of items) {
		const value = getItemValue(item);
		const label = getItemLabel(item);

		const option = document.createElement('button');
		option.type = 'button';
		option.textContent = label;
		option.className =
			'w-full cursor-pointer rounded-md px-2.5 py-2 text-left text-sm text-(--color-secondary) transition-colors not-first:mt-0.5 hover:bg-white/5 hover:text-(--color-primary)';

		const onOptionClick = () => {
			currentValue = value;
			selectedValue.textContent = label;

			updateSelectedOption();
			close();

			options.onChange?.(value);
		};

		option.addEventListener('click', onOptionClick);

		optionListeners.push({ element: option, handler: onOptionClick });

		optionElements.set(value, option);
		optionsContainer.append(option);
	}

	// === ACTION FUNCTIONS ===
	function findLabel(value: T): string {
		const item = items.find((item) => getItemValue(item) === value);
		return item ? getItemLabel(item) : String(value);
	}

	function getValue(): T {
		return currentValue;
	}

	function open() {
		closeAllSelects(optionsContainer);

		optionsContainer.classList.remove('hidden');
		arrow.classList.add('rotate-180');

		if (options.direction === 'up') {
			optionsContainer.style.top = 'auto';
			optionsContainer.style.bottom = `${selected.offsetHeight}px`;
		} else {
			optionsContainer.style.top = `${selected.offsetHeight}px`;
			optionsContainer.style.bottom = 'auto';
		}
	}

	function close() {
		optionsContainer.classList.add('hidden');
		arrow.classList.remove('rotate-180');
	}

	function updateSelectedOption() {
		optionElements.forEach((option, value) => {
			const isSelected = value === currentValue;
			option.classList.toggle('bg-white/5', isSelected);
			option.classList.toggle('text-(--color-primary)', isSelected);
		});
	}

	// === EVENTS ===
	function onSelectedClick(event: MouseEvent) {
		event.stopPropagation();

		const isOpen = !optionsContainer.classList.contains('hidden');

		if (isOpen) {
			close();
			return;
		}

		open();
	}

	function onDocumentClick(event: MouseEvent) {
		const target = event.target as Node | null;
		if (target && !container.contains(target)) close();
	}

	selected.addEventListener('click', onSelectedClick);
	document.addEventListener('click', onDocumentClick);

	// === LIFECYCLE ===
	function destroy() {
		selected.removeEventListener('click', onSelectedClick);
		document.removeEventListener('click', onDocumentClick);

		for (const { element, handler } of optionListeners) {
			element.removeEventListener('click', handler);
		}
	}

	// === INIT ===
	updateSelectedOption();

	// === ASSEMBLY ===
	container.append(selected, optionsContainer);

	return { element: container, getValue, destroy };

	// === HELPERS ===
	function getItemValue(item: T | SelectItem<T>): T {
		if (typeof item === 'object' && item !== null && 'value' in item) return item.value;
		return item;
	}

	function getItemLabel(item: T | SelectItem<T>): string {
		if (typeof item === 'object' && item !== null && 'label' in item) return item.label;
		return String(item);
	}

	function createItems(selectOptions: CreateSelectOptions<T>): Array<T | SelectItem<T>> {
		if (selectOptions.items) return [...selectOptions.items];

		if (typeof selectOptions.min === 'number' && typeof selectOptions.max === 'number') {
			const result: T[] = [];

			for (let value = selectOptions.min; value <= selectOptions.max; value++) {
				result.push(value as T);
			}

			return result;
		}

		return [selectOptions.initialValue ?? (0 as T)];
	}
};

function closeAllSelects(except?: HTMLElement) {
	document.querySelectorAll<HTMLElement>('[data-custom-select]').forEach((element) => {
		if (element !== except) element.classList.add('hidden');
	});
}
