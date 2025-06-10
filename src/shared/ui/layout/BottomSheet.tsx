import { useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';

import { IconBack } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: React.ReactNode;
}

const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
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

	return (
		<>
			{/* <div className="fixed inset-0 z-40" onClick={onClose} /> */}
			<div
				className="fixed inset-0 z-40 bg-black/60"
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						onClose();
					}
				}}
			/>
			<div
				className="core-base fixed right-0 bottom-0 left-0 z-50 rounded-t-xl"
				style={{
					transform: `translateY(${positionY}px)`,
					transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease',
				}}
			>
				<div
					{...bind()}
					className="drag-handle relative flex h-8 cursor-grab items-center justify-center bg-transparent select-none"
					style={{ touchAction: 'none' }}
				>
					<span
						className={cn(
							'absolute block h-1 origin-center rounded-xl bg-[var(--color-primary)] transition-all duration-300',
							getLineClass('top')
						)}
					/>
					<span
						className={cn(
							'absolute block h-1 origin-center rounded-xl bg-[var(--color-primary)] transition-all duration-300',
							getLineClass('bottom')
						)}
					/>
				</div>
				<div className="absolute top-4 flex h-4 w-full justify-between px-4">
					{onBack && (
						<IconBack className="w-5 cursor-pointer hover:text-[var(--accent-hover)]" onClick={onBack} />
					)}
				</div>
				<div className="max-h-[calc(100vh-3rem)] overflow-auto">{children}</div>
			</div>
		</>
	);
};

export default BottomSheet;
