import { IconBack } from '@/shared/assets/icons';

import { useBottomSheet } from '../model';
import { DragHandle } from '.';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: React.ReactNode;
}

const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
	const { positionY, isDraggingRef, bind, getLineClass } = useBottomSheet(onClose);

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-[var(--bg-overlay)]"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			/>
			<div
				className="core-base fixed right-0 bottom-0 left-0 z-40 h-fit max-h-screen overflow-y-auto rounded-t-xl pb-16"
				style={{
					transform: `translateY(${positionY}px)`,
					transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease',
				}}
			>
				<DragHandle bind={bind} getLineClass={getLineClass} />
				<div className="absolute top-4 flex h-4 w-full justify-between px-4">
					{onBack && (
						<IconBack className="size-5 cursor-pointer hover:text-[var(--accent-hover)]" onClick={onBack} />
					)}
				</div>
				<div>{children}</div>
			</div>
		</>
	);
};

export default BottomSheet;
