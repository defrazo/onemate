import { cn } from '@/shared/lib/utils';

import { deleteIcon, editIcon, insertSvg, viewIcon } from '../../lib';

type CreateTaskMenuProps = {
	trigger: HTMLButtonElement;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
};

export const createTaskMenu = ({ trigger, onView, onEdit, onDelete }: CreateTaskMenuProps) => {
	const element = document.createElement('div');
	element.dataset.taskOptions = '';
	element.className =
		'absolute top-8 right-0 z-20 hidden min-w-40 flex-col overflow-hidden rounded-lg border border-(--tone) bg-(--bg-tertiary)/50 p-1 shadow-lg backdrop-blur-sm';

	const definitions = [
		{ icon: viewIcon, title: 'Просмотреть', action: onView },
		{ icon: editIcon, title: 'Редактировать', action: onEdit },
		{ icon: deleteIcon, title: 'Удалить', action: onDelete, danger: true },
	];

	const options = definitions.map(({ icon, title, action, danger }) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = cn(
			'flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-(--text-secondary) transition-colors lg:h-7',
			danger
				? 'hover:bg-(--danger)/10 hover:text-(--status-error)/80'
				: 'hover:bg-(--tone-strong-hover) hover:text-(--text-primary)'
		);
		insertSvg(button, icon, 'size-4');

		const text = document.createElement('span');
		text.className = 'trim';
		text.textContent = title;

		button.append(text);

		const onClick = () => {
			element.classList.add('hidden');
			action();
		};

		button.addEventListener('click', onClick);

		return { button, onClick };
	});

	options.forEach(({ button }) => element.append(button));

	const onTriggerClick = (e: MouseEvent) => {
		e.stopPropagation();

		document.querySelectorAll('[data-task-options]').forEach((menu) => {
			if (menu !== element) menu.classList.add('hidden');
		});

		element.classList.toggle('hidden');
	};

	const onDocumentClick = (e: MouseEvent) => {
		const target = e.target as Node | null;
		if (!target) return;

		if (!element.contains(target) && !trigger.contains(target)) element.classList.add('hidden');
	};

	trigger.addEventListener('click', onTriggerClick);
	document.addEventListener('click', onDocumentClick);

	function destroy() {
		trigger.removeEventListener('click', onTriggerClick);
		document.removeEventListener('click', onDocumentClick);

		options.forEach(({ button, onClick }) => button.removeEventListener('click', onClick));
	}

	return { element, destroy };
};
