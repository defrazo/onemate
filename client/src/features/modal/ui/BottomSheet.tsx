import type { ReactNode } from 'react';

import { useBodyScrollLock } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { BackButton } from '@/shared/ui';

import { useDragger } from '../model';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: ReactNode;
}

export const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
	useBodyScrollLock(true);

	const { positionY, isDragging, bind, getLineClass } = useDragger(onClose);

	const lineStyle =
		'absolute block h-1 origin-center rounded-full bg-(--text-secondary) transition-transform duration-300';

	return (
		<>
			<div
				className="fixed inset-0 z-50 bg-(--bg-overlay)"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			/>
			<div
				className={cn(
					'fixed right-0 bottom-0 left-0 z-60 h-fit max-h-dvh rounded-t-xl bg-(--bg-secondary)',
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
					<div className="relative flex h-6 cursor-grab items-center justify-center bg-transparent pt-4 select-none">
						<span className={cn(lineStyle, getLineClass('top'))} />
						<span className={cn(lineStyle, getLineClass('bottom'))} />
					</div>
				</div>
				{onBack && <BackButton className="absolute top-2 right-2" onClick={onBack} />}
				<div className="px-3 pt-2 pb-4" {...bind()} style={{ touchAction: 'pan-y' }}>
					{children}
				</div>
			</div>
		</>
	);
};
