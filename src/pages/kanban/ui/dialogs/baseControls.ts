import closeIcon from '@/shared/assets/icons/actions/close.svg?raw';
import { cn } from '@/shared/lib/utils';

import { insertSvg } from '../../lib';
import { controls, layout } from '../styles';

export const createOverlay = () => {
	const overlay = document.createElement('div');
	overlay.className = layout.overlay;
	overlay.addEventListener('click', (event) => {
		if (event.target === overlay) close();
	});

	const close = () => overlay.remove();

	return { overlay, close };
};

export const createCloseButton = (onClose: () => void): HTMLButtonElement => {
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.className = cn(controls.iconButton, 'ml-auto');
	closeButton.addEventListener('click', onClose);
	insertSvg(closeButton, closeIcon, 'size-4');

	return closeButton;
};
