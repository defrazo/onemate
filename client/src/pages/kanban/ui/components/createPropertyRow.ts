import { insertSvg } from '../../lib';

export type PropertyRowInstance = {
	element: HTMLElement;
	content: HTMLElement;
};

export const createPropertyRow = (icon: string, label: string): PropertyRowInstance => {
	const element = document.createElement('div');
	element.className =
		'flex min-h-11 flex-wrap items-center gap-2 border-b border-(--border-color) px-2 py-1.5 last:border-b-0';

	const iconContainer = document.createElement('span');
	iconContainer.className = 'flex size-5 shrink-0 items-center justify-center text-(--color-disabled)';

	insertSvg(iconContainer, icon, 'size-5');

	const labelElement = document.createElement('span');
	labelElement.textContent = label;
	labelElement.className = 'trim min-w-0 flex-1 text-(--color-secondary) opacity-70';

	const content = document.createElement('div');
	content.className = 'ml-auto flex shrink-0 items-center justify-end';

	element.append(iconContainer, labelElement, content);

	return { element, content };
};
