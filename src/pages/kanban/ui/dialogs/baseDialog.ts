import { cn } from '@/shared/lib/utils';

import { getDivider } from '../../lib';
import { layout } from '../styles';
import { createCloseButton, createOverlay } from '.';

export const createDialog = (text: string, icon?: SVGElement) => {
	const { overlay, close } = createOverlay();

	// === CONTAINER ===
	const container = document.createElement('div');
	container.className = cn(
		layout.col,
		'core-card bg-(--bg-secondary)/50 text-(--color-primary) border border-(--border-color) backdrop-blur-sm md:w-md gap-3 p-3 relative'
	);

	// === HEADER ROW ===
	const header = document.createElement('div');
	header.className = cn(layout.row, 'gap-2 items-center');

	if (icon) header.append(icon);

	const title = document.createElement('h1');
	title.textContent = text;
	title.className = 'text-lg leading-4 cursor-default select-none font-bold text-(--color-text-primary)';

	const closeButton = createCloseButton(close);

	header.append(title, closeButton);

	// === DIVIDER ===
	const divider = getDivider('absolute left-0 top-11');

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(header, divider);

	return { overlay, container, close };
};
