import type { ReactNode } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';

import { useBodyScrollLock } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { useDragger } from '../model';
import { DragHandle } from '.';

interface BottomSheetProps {
	onBack?: () => void;
	onClose: () => void;
	children: ReactNode;
}

export const BottomSheet = ({ onBack, onClose, children }: BottomSheetProps) => {
	useBodyScrollLock(true);

	const { positionY, isDragging, bind, getLineClass } = useDragger(onClose);

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
					<Button
						className="absolute top-2 right-2 rounded-lg bg-white/5 px-2 py-1 text-xs text-(--color-secondary) active:bg-white/10"
						leftIcon={<IconChevronLeft className="size-3" />}
						size="custom"
						type="button"
						variant="mobile"
						onClick={onBack}
					>
						Назад
					</Button>
				)}
				<div className="px-2" {...bind()} style={{ touchAction: 'pan-y' }}>
					{children}
				</div>
			</div>
		</>
	);
};
