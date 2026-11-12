import { cn } from '@/shared/lib/utils';

import { dateIcon } from '../../lib/icons';
import { insertSvg } from '../../lib/utils';

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
		'relative flex min-h-8.5 min-w-0 items-center gap-1.5 rounded-md border border-(--tone-strong) bg-(--tone) p-2 text-center text-sm text-(--text-primary) transition-colors',
		!readonly && 'cursor-pointer hover:border-(--accent-primary-hover)/70 hover:bg-(--tone-hover)',
		className
	);

	// === ICON ===
	const icon = document.createElement('span');
	icon.className = 'flex size-3.5 shrink-0 items-center justify-center text-(--text-disabled)';
	insertSvg(icon, dateIcon, 'size-3');

	// === DISPLAY ===
	const display = document.createElement('span');
	display.textContent = formatDate(value);
	display.className = cn('trim mt-px min-w-0 flex-1', !value && 'text-(--text-disabled)');

	// === INPUT ===
	const input = document.createElement('input');
	input.type = 'date';
	input.value = value ?? '';
	input.readOnly = readonly;
	input.className = cn(
		'absolute inset-0 size-full opacity-0',
		readonly ? 'pointer-events-none cursor-default' : 'cursor-pointer'
	);

	// === CLEAR BUTTON ===
	const clearButton = document.createElement('button');
	clearButton.type = 'button';
	clearButton.title = 'Очистить дату';
	clearButton.textContent = '×';
	clearButton.className = cn(
		'relative z-10 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded text-(--text-disabled) hover:text-(--accent-primary)',
		(!value || readonly) && 'hidden'
	);

	// === ACTION FUNCTIONS ===
	function getValue(): string {
		return input.value;
	}

	function updateDisplay() {
		display.textContent = formatDate(input.value);
		display.classList.toggle('text-(--text-disabled)', !input.value);
		clearButton.classList.toggle('hidden', !input.value || readonly);
	}

	// === EVENTS ===
	function onContainerClick(e: MouseEvent) {
		if (readonly || clearButton.contains(e.target as Node)) return;

		input.showPicker?.();
	}

	function onInputChange() {
		updateDisplay();
		onChange?.(input.value);
	}

	function onClearClick(e: MouseEvent) {
		e.stopPropagation();

		input.value = '';
		updateDisplay();
		onChange?.('');
	}

	if (!readonly) {
		container.addEventListener('click', onContainerClick);
		input.addEventListener('change', onInputChange);
		clearButton.addEventListener('click', onClearClick);
	}

	// === LIFECYCLE ===
	function destroy() {
		if (readonly) return;

		container.removeEventListener('click', onContainerClick);
		input.removeEventListener('change', onInputChange);
		clearButton.removeEventListener('click', onClearClick);
	}

	// === ASSEMBLY ===
	container.append(icon, display, input, clearButton);

	return { element: container, getValue, destroy };
};

function formatDate(value: string | null): string {
	if (!value) return 'дд.мм.гггг';

	const [year, month, day] = value.split('-');
	return `${day}.${month}.${year}`;
}
