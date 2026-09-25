import { createCloseButton, createOverlay } from '.';

export const createDialog = (text: string, icon?: SVGElement) => {
	const { overlay, close } = createOverlay();

	// === CONTAINER ===
	const container = document.createElement('div');
	container.className =
		'hide-scrollbar relative flex h-fit max-h-full min-h-0 w-full max-w-md min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-xl border border-(--border-color) bg-(--bg-tertiary)/50 p-3 shadow-(--shadow) backdrop-blur-sm xl:gap-3 xl:p-4';
	// === HEADER ===
	const header = document.createElement('div');
	header.className = 'flex min-w-0 items-center gap-2 select-none';

	if (icon) {
		const iconContainer = document.createElement('div');
		iconContainer.className =
			'flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--accent-default)/10 text-(--accent-default)';
		iconContainer.append(icon);
		header.append(iconContainer);
	}

	const title = document.createElement('h1');
	title.textContent = text;
	title.className = 'min-w-0 flex-1 text-base font-bold 2xl:text-lg';

	const closeButton = createCloseButton(close);

	header.append(title, closeButton);

	// === ASSEMBLY ===
	overlay.append(container);
	container.append(header);

	return { overlay, container, close };
};
