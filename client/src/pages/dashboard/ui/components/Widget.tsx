import { type CSSProperties, Fragment, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripHorizontal } from '@tabler/icons-react';

import type { WidgetId } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { Button, Divider, Tooltip } from '@/shared/ui';

import type { WidgetItem } from '../../model';

interface WidgetProps {
	items: WidgetItem[];
	activeId?: WidgetId;
	onSelect: (id: WidgetId) => void;
}

export const Widget = memo(({ items, activeId, onSelect }: WidgetProps) => {
	const active = items.find((item) => item.id === activeId) ?? items[0];

	const { title, icon: Icon, content, tip } = active;
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: items[0].id,
	});

	const combinedStyle: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? undefined : transition,
		zIndex: isDragging ? 10 : 0,
		willChange: isDragging ? 'transform' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			data-widget
			className="core-surface-contrast core-pad group relative flex max-h-[45svh] min-h-0 min-w-0 flex-col gap-2 bg-(--bg-secondary) shadow-(--shadow-contrast) select-none md:gap-3 lg:landscape:max-h-[44.5svh] xl:landscape:max-h-[60svh] 2xl:landscape:max-h-[44svh] lg:landscape:[@media(max-height:600px)]:max-h-[75svh]"
			style={combinedStyle}
		>
			<header className="flex shrink-0 items-center justify-between">
				<Tooltip className="flex items-center gap-2" content={tip}>
					<div className="flex size-7 items-center justify-center rounded-md bg-(--accent-primary-muted)">
						<Icon className="size-4 text-(--accent-primary)" stroke={2.5} />
					</div>
				</Tooltip>
				{items.length === 1 && <h1 className="trim ml-2 text-lg font-bold select-none md:mr-auto">{title}</h1>}
				{items.length > 1 && (
					<div
						aria-label="Виджеты слота"
						className="mx-2 flex min-w-0 flex-1 items-center gap-2"
						role="tablist"
					>
						{items.map((item, idx) => (
							<div key={item.id} className="flex min-w-0 items-center gap-2">
								{idx > 0 && (
									<Divider className="my-auto h-2.5 bg-(--border-primary)" direction="Y" margX="xs" />
								)}
								<Button
									aria-selected={active.id === item.id}
									className={cn(
										'trim text-lg font-bold select-none md:mr-auto md:ml-0',
										active.id === item.id ? 'text-(--text-primary)' : 'text-(--text-disabled)/70'
									)}
									padding="none"
									role="tab"
									variant="custom"
									onClick={() => onSelect(item.id)}
								>
									{item.title}
								</Button>
							</div>
						))}
					</div>
				)}
				<Button
					centerIcon={<IconGripHorizontal className="size-4" />}
					className="cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100"
					padding="none"
					title="Переместить"
					variant="icon"
					{...listeners}
					{...attributes}
				/>
			</header>
			<Fragment key={active.id}>{content}</Fragment>
		</div>
	);
});
