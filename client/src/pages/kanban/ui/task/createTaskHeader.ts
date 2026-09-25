import { cn } from '@/shared/lib/utils';

import { insertSvg, optionsIcon } from '../../lib';
import type { Task } from '../../model';
import { createTaskMenu } from '.';

type CreateTaskHeaderProps = {
	task: Task;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
};

export const createTaskHeader = ({ task, onView, onEdit, onDelete }: CreateTaskHeaderProps) => {
	const element = document.createElement('div');
	element.className = 'relative flex min-w-0 items-center gap-2 px-3 pt-3';

	const title = document.createElement('h2');
	title.textContent = task.title;
	title.dataset.taskDragHandle = '';
	title.className = cn(
		'min-w-0 flex-1 cursor-grab truncate text-sm font-bold',
		task.completed && 'line-through opacity-30'
	);

	const optionsButton = document.createElement('button');
	optionsButton.type = 'button';
	optionsButton.title = 'Действия с задачей';
	optionsButton.className =
		'size-5 shrink-0 cursor-pointer text-(--color-secondary) transition-[color,opacity] hover:text-(--accent-hover) xl:opacity-0 xl:group-hover/task:opacity-100';
	insertSvg(optionsButton, optionsIcon, 'size-4');

	const menu = createTaskMenu({ trigger: optionsButton, onView, onEdit, onDelete });

	element.append(title, optionsButton, menu.element);

	return { element, dragHandle: title, destroy: menu.destroy };
};
