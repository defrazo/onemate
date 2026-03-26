import { cn } from '@/shared/lib/utils';

import { getDivider } from '../../lib';
import { border, layout, primitives } from '../styles';
import { createCloseButton, createOverlay } from '.';

export const createDialog = (text: string, icon?: SVGElement) => {
	const { overlay, close } = createOverlay();

	// === CONTAINER ===
	const container = document.createElement('div');
	container.className = cn(
		layout.blur,
		layout.col,
		border.default,
		'text-(--color-primary) min-w-0 h-fit max-h-full min-h-0 w-full xl:w-md gap-3 p-3 relative hide-scrollbar overflow-y-auto overscroll-contain'
	);

	// === HEADER ROW ===
	const header = document.createElement('div');
	header.className = cn(layout.row, 'gap-2');

	if (icon) header.append(icon);

	const title = document.createElement('h1');
	title.textContent = text;
	title.className = cn(primitives.title, 'text-lg');

	const closeButton = createCloseButton(close);

	header.append(title, closeButton);

	// === DIVIDER ===
	const divider = getDivider('absolute left-0 top-12');

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(header, divider);

	return { overlay, container, close };
};
