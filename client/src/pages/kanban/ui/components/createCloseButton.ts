import { closeIcon, insertSvg } from '../../lib';

export const createCloseButton = (onClose: () => void) => {
	const button = document.createElement('button');
	button.type = 'button';
	button.title = 'Закрыть';
	button.setAttribute('aria-label', 'Закрыть');
	button.className =
		'ml-auto inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-(--color-secondary) transition-colors select-none hover:text-(--accent-hover) disabled:pointer-events-none disabled:opacity-50';
	insertSvg(button, closeIcon, 'size-4');

	button.addEventListener('click', onClose);

	return button;
};
