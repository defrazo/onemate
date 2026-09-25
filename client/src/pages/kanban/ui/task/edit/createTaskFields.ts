import { LIMITS } from '../../../model';

type CreateTaskFieldsProps = {
	title: string;
	description?: string;
	onChange: () => void;
};

export const createTaskFields = ({
	title: initialTitle,
	description: initialDescription,
	onChange,
}: CreateTaskFieldsProps) => {
	// === CONTAINER ===
	const element = document.createElement('div');
	element.className = 'flex flex-col gap-2 select-none';

	// === TITLE ===
	const titleField = document.createElement('div');
	titleField.className = 'flex flex-col gap-1';

	const titleLabel = document.createElement('label');
	titleLabel.htmlFor = 'task-title';
	titleLabel.textContent = 'Название задачи';
	titleLabel.className = 'text-sm text-(--color-secondary) opacity-70';

	const title = document.createElement('input');
	title.type = 'text';
	title.id = 'task-title';
	title.name = 'task-title';
	title.value = initialTitle;
	title.autocomplete = 'off';
	title.placeholder = 'Введите название задачи';
	title.className =
		'w-full rounded-xl border border-(--border-color) bg-(--bg-tertiary)/50 p-2 transition-colors outline-none hover:border-(--accent-hover) focus:border-(--accent-hover)';

	const titleHint = document.createElement('span');
	titleHint.className = 'ml-auto text-xs text-(--color-secondary) opacity-70';

	const onTitleInput = () => {
		updateTitleHint();
		onChange();
	};

	title.addEventListener('input', onTitleInput);

	titleField.append(titleLabel, title, titleHint);

	// === DESCRIPTION ===
	const descriptionField = document.createElement('div');
	descriptionField.className = 'flex flex-col gap-1';

	const descriptionLabel = document.createElement('label');
	descriptionLabel.htmlFor = 'task-description';
	descriptionLabel.textContent = 'Комментарий';
	descriptionLabel.className = 'text-sm text-(--color-secondary) opacity-70';

	const description = document.createElement('textarea');
	description.id = 'task-description';
	description.name = 'task-description';
	description.value = initialDescription ?? '';
	description.autocomplete = 'off';
	description.placeholder = 'Добавьте комментарий к задаче';
	description.className =
		'hide-scrollbar min-h-24 w-full resize-none rounded-xl border border-(--border-color) bg-(--bg-tertiary)/50 p-2 transition-colors outline-none hover:border-(--accent-hover) focus:border-(--accent-hover) 2xl:min-h-28';

	const descriptionHint = document.createElement('span');
	descriptionHint.className = 'ml-auto text-xs text-(--color-secondary) opacity-70';

	const onDescriptionInput = () => {
		updateDescriptionHint();
		onChange();
	};

	description.addEventListener('input', onDescriptionInput);

	descriptionField.append(descriptionLabel, description, descriptionHint);

	// === ACTION FUNCTIONS ===
	function getTitle(): string {
		return title.value.trim();
	}

	function getDescription(): string {
		return description.value.trim();
	}

	function updateTitleHint() {
		const value = getTitle();
		const length = value.length;
		const tooLong = length > LIMITS.TASK_TITLE;

		titleHint.textContent = value
			? `${length} / ${LIMITS.TASK_TITLE} символов`
			: `Введите название (до ${LIMITS.TASK_TITLE} символов)`;

		titleHint.classList.toggle('text-(--status-error)', tooLong);
	}

	function updateDescriptionHint() {
		const value = getDescription();
		const length = value.length;
		const tooLong = length > LIMITS.TASK_DESC;

		descriptionHint.textContent = value
			? `${length} / ${LIMITS.TASK_DESC} символов`
			: `Необязательно, до ${LIMITS.TASK_DESC} символов`;

		descriptionHint.classList.toggle('text-(--status-error)', tooLong);
	}

	// === LIFECYCLE ===
	function destroy() {
		title.removeEventListener('input', onTitleInput);
		description.removeEventListener('input', onDescriptionInput);
	}

	// === INIT ===
	updateTitleHint();
	updateDescriptionHint();

	// === ASSEMBLY ===
	element.append(titleField, descriptionField);

	return { element, getTitle, getDescription, destroy };
};
