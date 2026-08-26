import closeIcon from '@/shared/assets/icons/actions/close.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';
import { button, layout } from '..';

export const createOverlay = () => {
	const overlay = document.createElement('div');
	overlay.className = layout.overlay;
	overlay.tabIndex = -1;
	overlay.style.outline = 'none';
	overlay.addEventListener('mousedown', onClickOutside);
	overlay.addEventListener('keydown', onEscape);
	document.body.style.overflow = 'hidden';

	// === ACTION FUNCTIONS ===
	function onClickOutside(event: MouseEvent) {
		if (event.target === overlay) close();
	}

	function onEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	queueMicrotask(() => {
		if (overlay.isConnected) overlay.focus({ preventScroll: true });
	});

	// === LIFECYCLE ===
	function close() {
		overlay.remove();
		overlay.removeEventListener('mousedown', onClickOutside);
		overlay.removeEventListener('keydown', onEscape);
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

export const createSubmitButton = (text: string, className?: string): HTMLButtonElement => {
	const submitButton = document.createElement('button');
	submitButton.type = 'submit';
	submitButton.textContent = text;
	submitButton.className = cn(button.default, 'mx-auto mt-2 w-52 py-1.5', className);

	return submitButton;
};

export const createActionButton = (text: string, onClick: () => void, className?: string): HTMLButtonElement => {
	const actionButton = document.createElement('button');
	actionButton.type = 'button';
	actionButton.textContent = text;
	actionButton.className = cn(button.default, 'mx-auto mt-2 w-52 py-1.5', className);
	actionButton.addEventListener('click', onClick);

	return actionButton;
};
