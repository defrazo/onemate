import { fullDate } from '@/shared/lib/utils';

export const createTaskMeta = ({ created, updated }: { created: string; updated: string | null }) => {
	const element = document.createElement('div');
	element.className = 'mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 select-none';

	const createdItem = document.createElement('span');
	createdItem.textContent = `Создано ${fullDate(created)}`;
	createdItem.className = 'trim text-xs text-(--color-secondary) opacity-70';

	element.append(createdItem);

	if (updated) {
		const separator = document.createElement('span');
		separator.textContent = '·';
		separator.className = 'trim text-sm text-(--color-secondary) opacity-70';

		const updatedItem = document.createElement('span');
		updatedItem.textContent = `Изменено ${fullDate(updated)}`;
		updatedItem.className = 'trim text-xs text-(--color-secondary) opacity-70';

		element.append(separator, updatedItem);
	}

	return { element };
};
