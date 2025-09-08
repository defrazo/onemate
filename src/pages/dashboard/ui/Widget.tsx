import type { CSSProperties, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { IconMove } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface WidgetProps {
	id: string;
	content: ReactNode;
}

export const Widget = ({ id, content }: WidgetProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const combinedStyle: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : 0,
	};

	return (
		<div
			ref={setNodeRef}
			className="core-card core-base relative flex flex-1 flex-col justify-between gap-2 shadow-[var(--shadow)] select-none"
			style={combinedStyle}
		>
			<Button
				centerIcon={<IconMove className="size-4 rotate-90" />}
				className="absolute top-2 right-0 cursor-move touch-none"
				size="sm"
				title="Переместить"
				variant="mobile"
				{...listeners}
				{...attributes}
			/>
			{content}
		</div>
	);
};
