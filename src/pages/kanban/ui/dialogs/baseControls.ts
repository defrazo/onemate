import closeIcon from '@/shared/assets/icons/actions/close.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';
import { button, layout } from '../styles';

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
