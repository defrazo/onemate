import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { IconMove } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface WidgetProps {
	id: string;
	children: React.ReactElement<any>;
	disabled?: boolean;
}

export const Widget = ({ id, children, disabled }: WidgetProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });

	const combinedStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} className={cn('relative flex h-full min-h-0 flex-col')} style={combinedStyle}>
			<Button
				centerIcon={<IconMove className="size-4 rotate-90" />}
				className="absolute top-2 right-0 cursor-move touch-none"
				size="sm"
				title="Переместить"
				variant="mobile"
				{...listeners}
				{...attributes}
			/>
			{children}
		</div>
	);
};
