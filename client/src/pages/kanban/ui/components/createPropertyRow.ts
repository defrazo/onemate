import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';

export const createPropertyRow = (icon: string, label: string, interactive = true) => {
	const element = document.createElement('div');
	element.className = cn(
		'group flex min-h-11 flex-wrap items-center gap-2 border-b border-(--border-primary) px-2 py-1.5 first:rounded-t-lg last:rounded-b-lg last:border-b-0',
		interactive && 'transition-colors hover:bg-(--tone-hover)'
	);

	const iconContainer = document.createElement('span');
	iconContainer.className = cn(
		'flex size-5 shrink-0 items-center justify-center text-(--text-disabled)',
		interactive && 'transition-colors group-hover:text-(--accent-primary)'
	);

	insertSvg(iconContainer, icon, 'size-5');

	const labelElement = document.createElement('span');
	labelElement.textContent = label;
	labelElement.className = cn(
		'trim min-w-0 flex-1 text-sm text-(--text-secondary)',
		interactive && 'transition-colors group-hover:text-(--text-primary)'
	);

	const content = document.createElement('div');
	content.className = 'ml-auto flex shrink-0 items-center justify-end';

	element.append(iconContainer, labelElement, content);

	return { element, content };
};
