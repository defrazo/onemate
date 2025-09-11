import { useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';

export const useDragger = (onClose: () => void) => {
	const [positionY, setPositionY] = useState<number>(0);
	const [dragDirection, setDragDirection] = useState<'none' | 'up' | 'down'>('none');
	const isDraggingRef = useRef<boolean>(false);

	const bind = useDrag(
		({ first, last, movement, direction, cancel, event, intentional, tap }) => {
			const [, moveY] = movement;

			if (tap) return;

			if (first) isDraggingRef.current = true;

			if (intentional && !last) {
				const scrollEl = findScrollableParent(event.target as HTMLElement);

				if (scrollEl) {
					const { scrollTop, clientHeight, scrollHeight } = scrollEl;
					const atTop = scrollTop <= 0;
					const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

					const draggingDown = direction[1] > 0;
					const draggingUp = direction[1] < 0;

					if ((draggingDown && !atTop) || (draggingUp && !atBottom)) {
						cancel();
						isDraggingRef.current = false;
						return;
					}
				}
			}

			if (!last) {
				setPositionY(Math.max(moveY, 0));

				const dirY = direction[1];
				if (Math.abs(dirY) < 0.1) setDragDirection('none');
				else if (dirY > 0) setDragDirection('down');
				else setDragDirection('up');
			} else {
				isDraggingRef.current = false;

				if (moveY > 150) onClose();
				else {
					setPositionY(0);
					setDragDirection('none');
				}
			}
		},
		{
			axis: 'y',
			from: () => [0, positionY],
			filterTaps: true,
			threshold: 10,
			rubberband: 0.15,
			preventScroll: false,
			pointer: { touch: true },
		}
	);

	const getLineClass = (line: 'top' | 'bottom') => {
		if (dragDirection === 'up') {
			return line === 'top'
				? 'w-5 -translate-x-2 translate-y-0.5  -rotate-[20deg]'
				: 'w-5 translate-x-2 translate-y-0.5 rotate-[20deg]';
		}

		if (dragDirection === 'down') {
			return line === 'bottom'
				? 'w-5 -translate-x-2 -translate-y-0.5  rotate-[20deg]'
				: 'w-5 translate-x-2 -translate-y-0.5 -rotate-[20deg]';
		}

		return 'w-10 translate-x-0 rotate-0';
	};

	return { positionY, isDragging: isDraggingRef.current, bind, getLineClass };
};

const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
	let current = element;

	while (current && current !== document.body) {
		const hasOverflow = /(auto|scroll)/.test(window.getComputedStyle(current).overflowY);
		if (hasOverflow && current.scrollHeight > current.clientHeight) return current;
		current = current.parentElement as HTMLElement;
	}

	return null;
};
