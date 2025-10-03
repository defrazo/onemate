import type { ReactNode } from 'react';

import { IconBack } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';

import { useDragger } from '../model';
import { DragHandle } from '.';
import { useBodyScrollLock } from '@/shared/lib/hooks';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: ReactNode;
}

export const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
	const { positionY, isDragging, bind, getLineClass } = useDragger(onClose);

	useBodyScrollLock(true);

	return (
		<>
			<div
				className="fixed inset-0 z-50 bg-[var(--bg-overlay)]"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			/>
			<div
				className={cn(
					'core-base fixed right-0 bottom-0 left-0 z-60 h-fit max-h-dvh rounded-t-xl',
					isDragging ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'
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
				{onBack && (
					<div className="absolute top-[34px] w-1/4 pl-2" onClick={onBack}>
						<IconBack className="size-5 cursor-pointer hover:text-[var(--accent-hover)]" />
					</div>
				)}
				<div className="px-2" {...bind()} style={{ touchAction: 'pan-y' }}>
					{children}
				</div>
			</div>
		</>
	);
};
