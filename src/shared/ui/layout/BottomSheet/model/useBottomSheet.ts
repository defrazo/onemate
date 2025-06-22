import { useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';

export const useBottomSheet = (onClose: () => void) => {
	const [positionY, setPositionY] = useState<number>(0);
	const [dragDirection, setDragDirection] = useState<'none' | 'up' | 'down'>('none');
	const isDraggingRef = useRef<boolean>(false);
	const previousYRef = useRef<number | null>(null);

	const bind = useDrag(
		({ last, movement }) => {
			const moveY = movement[1];
			const prevY = previousYRef.current;
			const deltaY = prevY !== null ? moveY - prevY : 0;

			if (!last) {
				isDraggingRef.current = true;
				setPositionY(Math.max(moveY, 0));

				if (prevY !== null) {
					if (Math.abs(deltaY) < 1) setDragDirection('none');
					else if (deltaY > 0) setDragDirection('down');
					else setDragDirection('up');
				}

				previousYRef.current = moveY;
			} else {
				isDraggingRef.current = false;

				if (moveY > 150) onClose();

				setPositionY(0);
				setDragDirection('none');
				previousYRef.current = null;
			}
		},
		{ axis: 'y', from: () => [0, positionY], filterTaps: true, pointer: { touch: true } }
	);

	const getLineClass = (line: 'top' | 'bottom') => {
		if (dragDirection === 'up') {
			return line === 'top' ? 'w-5 translate-x-2 rotate-[25deg]' : 'w-5 -translate-x-2 -rotate-[25deg]';
		}
		if (dragDirection === 'down') {
			return line === 'top' ? 'w-5 translate-x-2 -rotate-[25deg]' : 'w-5 -translate-x-2 rotate-[25deg]';
		}
		return 'w-10 translate-x-0 rotate-0';
	};

	return {
		positionY,
		isDraggingRef,
		bind,
		getLineClass,
	};
};
