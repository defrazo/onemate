import { cn } from '@/shared/lib/utils';

type CustomSelectItem<T extends string | number = string | number> = {
	value: T;
	label: string;
};

type CustomSelectOptions<T extends string | number = number> = {
	initialValue?: T;
	items?: T[] | CustomSelectItem<T>[];
	min?: number;
	max?: number;
	onChange?: (value: T) => void;
};

export const createCustomSelect = <T extends string | number = number>(
	options: CustomSelectOptions<T> = {},
	className?: string
): HTMLDivElement => {
	const container = document.createElement('div');
	container.className = cn('relative inline-block w-32 text-center cursor-pointer select-none', className);

	let items: Array<T | CustomSelectItem<T>> = [];
	if (options.items) items = options.items;
	else if (typeof options.min === 'number' && typeof options.max === 'number') {
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
	selectedValue.className = 'flex-1';

	const arrow = document.createElement('span');
	arrow.className = 'arrow ml-2';
	arrow.innerHTML = '&#9662;';

	selected.append(selectedValue, arrow);

	const optionsContainer = document.createElement('div');
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
		optionsContainer.classList.toggle('hidden');
	});

	container.append(selected, optionsContainer);

	document.addEventListener('click', (event) => {
		if (!container.contains(event.target as Node)) optionsContainer.classList.add('hidden');
	});

	return container;
};
