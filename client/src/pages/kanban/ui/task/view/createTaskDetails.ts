import { cn } from '@/shared/lib/utils';

export const createTaskDetails = ({ title, description }: { title: string; description?: string }) => {
	const element = document.createElement('div');
	element.className = 'flex flex-col gap-3 select-none';

	// === TITLE ===
	const titleField = document.createElement('div');
	titleField.className = 'flex flex-col gap-1';

	const titleLabel = document.createElement('span');
	titleLabel.textContent = 'Название задачи';
	titleLabel.className = 'text-sm text-(--text-secondary) opacity-70 select-none';

	const titleValue = document.createElement('div');
	titleValue.textContent = title;
	titleValue.className =
		'cursor-default rounded-lg bg-(--tone) px-3 py-2.5 text-sm text-(--text-primary) 2xl:text-base';

	titleField.append(titleLabel, titleValue);

	// === DESCRIPTION ===
	const descriptionField = document.createElement('div');
	descriptionField.className = 'flex flex-col gap-1';

	const descriptionLabel = document.createElement('span');
	descriptionLabel.textContent = 'Комментарий';
	descriptionLabel.className = 'text-sm text-(--text-secondary) opacity-70 select-none';

	const descriptionValue = document.createElement('p');
	descriptionValue.textContent = description || 'Комментарий не добавлен';
	descriptionValue.className = cn(
		'min-h-16 cursor-default rounded-lg bg-(--tone) px-3 py-2.5 text-sm leading-5 whitespace-pre-wrap 2xl:text-base',
		description ? 'text-(--text-primary)' : 'text-(--text-disabled)'
	);

	descriptionField.append(descriptionLabel, descriptionValue);

	// === ASSEMBLY ===
	element.append(titleField, descriptionField);

	return { element };
};
