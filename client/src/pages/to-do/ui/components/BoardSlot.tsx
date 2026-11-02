import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface BoardSlotProps {
	slot: number;
	disabled: boolean;
	dragging: boolean;
	children?: ReactNode;
}

export const BoardSlot = ({ slot, disabled, dragging, children }: BoardSlotProps) => {
	const { setNodeRef, isOver } = useDroppable({ id: `slot:${slot}`, data: { kind: 'slot', slot }, disabled });

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'relative min-h-12 min-w-0 self-stretch rounded-lg',
				dragging &&
					'bg-(--border-secondary)/10 outline -outline-offset-2 outline-(--border-primary) outline-dashed',
				dragging && isOver && 'bg-(--accent-primary-muted) outline-2 outline-(--accent-primary)'
			)}
		>
			{children}
		</div>
	);
};
