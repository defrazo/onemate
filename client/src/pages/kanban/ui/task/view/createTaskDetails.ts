import { cn } from '@/shared/lib/utils';

export const createTaskDetails = ({ title, description }: { title: string; description?: string }) => {
	const element = document.createElement('div');
	element.className = 'flex flex-col gap-3';

	// === TITLE ===
	const titleField = document.createElement('div');
	titleField.className = 'flex flex-col gap-1';

	const titleLabel = document.createElement('span');
	titleLabel.textContent = 'Название задачи';
	titleLabel.className = 'text-sm text-(--color-secondary) opacity-70 select-none';

	const titleValue = document.createElement('div');
	titleValue.textContent = title;
	titleValue.className =
		'rounded-lg border border-(--border-color) bg-white/3 px-3 py-2.5 text-sm text-(--color-secondary) 2xl:text-base';

	titleField.append(titleLabel, titleValue);

	// === DESCRIPTION ===
	const descriptionField = document.createElement('div');
	descriptionField.className = 'flex flex-col gap-1';

	const descriptionLabel = document.createElement('span');
	descriptionLabel.textContent = 'Комментарий';
	descriptionLabel.className = 'text-sm text-(--color-secondary) opacity-70 select-none';

	const descriptionValue = document.createElement('p');
	descriptionValue.textContent = description || 'Комментарий не добавлен';
	descriptionValue.className = cn(
		'min-h-24 rounded-lg border border-(--border-color) bg-white/3 px-3 py-2.5 text-sm leading-5 whitespace-pre-wrap 2xl:text-base',
		description ? 'text-(--color-secondary)' : 'text-(--color-disabled)'
	);

	descriptionField.append(descriptionLabel, descriptionValue);

	// === ASSEMBLY ===
	element.append(titleField, descriptionField);

	return { element };
};
