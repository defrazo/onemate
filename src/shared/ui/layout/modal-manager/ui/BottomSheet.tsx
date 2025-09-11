import type { ReactNode } from 'react';

import { IconBack } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';

import { useDragger } from '../model';
import { DragHandle } from '.';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: ReactNode;
}

export const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
	const { positionY, isDragging, bind, getLineClass } = useDragger(onClose);

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-[var(--bg-overlay)]"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			/>
			<div
				className={cn(
					'core-base fixed right-0 bottom-0 left-0 z-60 h-fit max-h-dvh rounded-t-xl',
					isDragging ? 'overflow-hidden' : 'overflow-y-auto'
				)}
				style={{
					transform: `translateY(${positionY}px)`,
					transition: isDragging ? 'none' : 'transform 0.25s ease-out',
					willChange: 'transform',
					touchAction: 'pan-y',
				}}
			>
				<div {...bind()} style={{ touchAction: 'none' }}>
					<DragHandle getLineClass={getLineClass} />
				</div>
				<div className="absolute top-4 flex h-4 w-full justify-between px-4">
					{onBack && (
						<IconBack className="size-5 cursor-pointer hover:text-[var(--accent-hover)]" onClick={onBack} />
					)}
				</div>
				<div {...bind()} style={{ touchAction: 'pan-y' }}>
					{children}
				</div>
			</div>
		</>
	);
};
