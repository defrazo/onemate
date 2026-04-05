import closeIcon from '@/shared/assets/icons/actions/close.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';
import { button, layout } from '..';

export const createOverlay = () => {
	const overlay = document.createElement('div');
	overlay.className = layout.overlay;
	overlay.addEventListener('mousedown', onClickOutside);

	document.body.style.overflow = 'hidden';
	document.addEventListener('keydown', onEscape);

	function onClickOutside(event: MouseEvent) {
		if (event.target === overlay) close();
	}

	function onEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	function close() {
		overlay.remove();
		overlay.removeEventListener('mousedown', onClickOutside);
		document.removeEventListener('keydown', onEscape);
		document.body.style.overflow = '';
	}

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
	submitButton.className = cn(button.default, 'mx-auto mt-2 w-52 py-1.5', className);
	submitButton.addEventListener('click', onSubmit);

	return submitButton;
};
