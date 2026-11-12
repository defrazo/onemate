import { useState } from 'react';
import { autoUpdate, flip, offset, shift, size, useDismiss, useFloating, useInteractions } from '@floating-ui/react';

import type { Direction, ListPlacement } from './types';

export const useSelect = (
	direction: Direction = 'auto',
	listPlacement: ListPlacement = 'start',
	listWidth?: number
) => {
	const [isOpen, setIsOpen] = useState(false);

	const placement = `${direction === 'up' ? 'top' : 'bottom'}-${listPlacement}` as const;

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(4),
			flip({ padding: 8 }),
			shift({ padding: 8 }),
			size({
				padding: 8,
				apply({ rects, availableHeight, elements }) {
					const width = listWidth ?? rects.reference.width;
					const maxHeight = Math.max(0, Math.min(224, availableHeight));

					elements.floating.style.width = `${width}px`;
					elements.floating.style.setProperty('--select-max-height', `${maxHeight}px`);
				},
			}),
		],
	});

	const dismiss = useDismiss(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

	const close = (): void => setIsOpen(false);
	const toggle = (): void => setIsOpen((open) => !open);

	return { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps, close, toggle };
};
