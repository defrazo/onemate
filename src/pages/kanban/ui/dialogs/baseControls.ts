import closeIcon from '@/shared/assets/icons/actions/close.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';
import { button, layout } from '..';

export const createOverlay = () => {
	const overlay = document.createElement('div');
	overlay.className = layout.overlay;
	overlay.addEventListener('mousedown', (event) => {
		if (event.target === overlay) close();
	});

	const close = () => overlay.remove();

	return { overlay, close };
};

export const createCloseButton = (onClose: () => void): HTMLButtonElement => {
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.className = cn(button.icon, 'ml-auto');
	closeButton.addEventListener('click', onClose);
	insertSvg(closeButton, closeIcon, 'size-4');

	return closeButton;
};

export const createSubmitButton = (text: string, onSubmit: () => void, className?: string): HTMLButtonElement => {
	const submitButton = document.createElement('button');
	submitButton.type = 'button';
	submitButton.textContent = text;
	submitButton.className = cn(button.default, 'w-52 mt-2 py-1.5 mx-auto', className);
	submitButton.addEventListener('click', onSubmit);

	return submitButton;
};
