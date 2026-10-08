import { LIMITS } from '../../../model';

export const createColumnDetails = ({ title: initialTitle, onChange }: { title: string; onChange: () => void }) => {
	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col gap-1';

	// === LABEL ===
	const label = document.createElement('label');
	label.htmlFor = 'column-title';
	label.textContent = 'Название колонки';
	label.className = 'text-sm text-(--text-secondary) opacity-70';

	// === INPUT ===
	const input = document.createElement('input');
	input.type = 'text';
	input.id = 'column-title';
	input.name = 'column-title';
	input.value = initialTitle;
	input.autocomplete = 'off';
	input.placeholder = 'Введите название колонки';
	input.className =
		'w-full rounded-lg border border-transparent bg-(--tone) p-2 text-(--text-primary) shadow-(--shadow-contrast) transition-colors outline-none hover:border-(--accent-primary-hover)/70 focus:border-(--accent-primary) focus:text-(--text-primary)';

	// === HINT ===
	const hint = document.createElement('span');
	hint.className = 'ml-auto text-xs text-(--text-secondary) opacity-70';

	// === EVENTS ===
	const onInput = () => {
		updateHint();
		onChange();
	};

	input.addEventListener('input', onInput);

	// === ACTION FUNCTIONS ===
	function getTitle(): string {
		return input.value.trim();
	}

	function updateHint() {
		const length = input.value.trim().length;
		const tooLong = length > LIMITS.COLUMN_TITLE;

		hint.textContent = length
			? `${length} / ${LIMITS.COLUMN_TITLE} символов`
			: `До ${LIMITS.COLUMN_TITLE} символов`;

		hint.style.color = tooLong ? 'var(--status-error)' : '';
	}

	// === LIFECYCLE ===
	function destroy() {
		input.removeEventListener('input', onInput);
	}

	// === INIT ===
	updateHint();

	// === ASSEMBLY ===
	element.append(label, input, hint);

	return { element, getTitle, destroy };
};
