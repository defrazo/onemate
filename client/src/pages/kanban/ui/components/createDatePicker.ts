import { cn } from '@/shared/lib/utils';

import { dateIcon, insertSvg } from '../../lib';

type CreateDatePickerProps = {
	value?: string | null;
	readonly?: boolean;
	className?: string;
	onChange?: (value: string) => void;
};

export const createDatePicker = ({
	value = null,
	readonly = false,
	className,
	onChange,
}: CreateDatePickerProps = {}) => {
	// === CONTAINER ===
	const container = document.createElement('div');
	container.className = cn(
		'relative flex min-h-8.5 min-w-0 items-center rounded-lg border border-(--border-color) bg-white/3 px-2.5 py-2 text-center text-sm text-(--color-primary) transition-colors',
		!readonly && 'cursor-pointer hover:border-white/15 hover:bg-white/5',
		className
	);

	// === ICON ===
	const icon = document.createElement('span');
	icon.className = 'flex size-3.5 shrink-0 items-center justify-center text-(--color-disabled)';
	insertSvg(icon, dateIcon, 'size-3.5');

	// === DISPLAY ===
	const display = document.createElement('span');
	display.textContent = formatDate(value);
	display.className = cn('trim min-w-0 flex-1', !value && 'text-(--color-disabled)');

	// === INPUT ===
	const input = document.createElement('input');
	input.type = 'date';
	input.value = value ?? '';
	input.readOnly = readonly;
	input.className = cn(
		'absolute inset-0 size-full opacity-0',
		readonly ? 'pointer-events-none cursor-default' : 'cursor-pointer'
	);

	// === ACTION FUNCTIONS ===
	function getValue(): string {
		return input.value;
	}

	function updateDisplay() {
		display.textContent = formatDate(input.value);
		display.classList.toggle('text-(--color-disabled)', !input.value);
	}

	// === EVENTS ===
	function onContainerClick() {
		if (readonly) return;

		input.showPicker?.();
	}

	function onInputChange() {
		updateDisplay();
		onChange?.(input.value);
	}

	if (!readonly) {
		container.addEventListener('click', onContainerClick);
		input.addEventListener('change', onInputChange);
	}

	// === LIFECYCLE ===
	function destroy() {
		if (readonly) return;

		container.removeEventListener('click', onContainerClick);
		input.removeEventListener('change', onInputChange);
	}

	// === ASSEMBLY ===
	container.append(icon, display, input);

	return { element: container, getValue, destroy };
};

function formatDate(value: string | null): string {
	if (!value) return 'дд.мм.гггг';
	const [year, month, day] = value.split('-');
	return `${day}.${month}.${year}`;
}
