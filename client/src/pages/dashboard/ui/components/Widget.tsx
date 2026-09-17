import { type CSSProperties, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripHorizontal } from '@tabler/icons-react';

import { Button, Tooltip } from '@/shared/ui';

import type { WidgetItem } from '../../model';

export const Widget = memo(({ id, title, icon: Icon, content, tip }: WidgetItem) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const combinedStyle: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? undefined : transition,
		zIndex: isDragging ? 10 : 0,
		willChange: isDragging ? 'transform' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			className="core-card group core-base relative flex min-h-0 min-w-0 flex-col gap-2 shadow-(--shadow) select-none"
			style={combinedStyle}
		>
			<header className="flex items-center justify-between">
				<Tooltip className="flex items-center gap-2" content={tip}>
					<div className="flex size-7 items-center justify-center rounded-lg bg-(--accent-default)/10">
						<Icon className="size-4 text-(--accent-default)" stroke={2.5} />
					</div>
					<h1 className="trim text-lg font-bold select-none md:mr-auto md:ml-0">{title}</h1>
				</Tooltip>
				<Button
					centerIcon={<IconGripHorizontal className="size-4 text-(--color-secondary)" />}
					className="cursor-grab touch-none pl-4 opacity-0 transition-opacity group-hover:opacity-100"
					size="custom"
					title="Переместить"
					variant="mobile"
					{...listeners}
					{...attributes}
				/>
			</header>
			<div className="flex min-h-0 flex-1 flex-col gap-2">{content}</div>
		</div>
	);
});
