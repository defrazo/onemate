import { cn } from '@/shared/lib/utils';

import { getDivider } from '../../lib';
import { border, layout, primitives } from '..';
import { createCloseButton, createOverlay } from '.';

export const createDialog = (text: string, icon?: SVGElement) => {
	const { overlay, close } = createOverlay();

	// === CONTAINER ===
	const container = document.createElement('div');
	container.className = cn(
		layout.blur,
		layout.col,
		border.default,
		'hide-scrollbar relative h-fit max-h-full min-h-0 w-full max-w-md min-w-0 gap-3 overflow-x-hidden overflow-y-auto p-3'
	);

	// === HEADER ROW ===
	const header = document.createElement('div');
	header.className = cn(layout.row, 'gap-2');

	if (icon) header.append(icon);

	const title = document.createElement('h1');
	title.textContent = text;
	title.className = cn(primitives.title, 'text-base 2xl:text-lg');

	const closeButton = createCloseButton(close);

	header.append(title, closeButton);

	// === DIVIDER ===
	const divider = getDivider('absolute top-12 left-0');

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(header, divider);

	return { overlay, container, close };
};
