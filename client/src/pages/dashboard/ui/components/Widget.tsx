import { type CSSProperties, Fragment, memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripHorizontal } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button, Divider, Tooltip } from '@/shared/ui';

import type { WidgetItem } from '../../model';

export const Widget = memo(({ items }: { items: WidgetItem[] }) => {
	const [activeId, setActiveId] = useState(items[0].id);

	const active = items.find((item) => item.id === activeId) ?? items[0];

	const { title, icon: Icon, content, tip } = active;
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: items[0].id });

	const combinedStyle: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? undefined : transition,
		zIndex: isDragging ? 10 : 0,
		willChange: isDragging ? 'transform' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			className="core-surface-contrast core-pad group relative flex max-h-[45svh] min-h-0 min-w-0 flex-col gap-2 bg-(--bg-secondary) shadow-(--shadow-contrast) select-none md:gap-3 2xl:h-full lg:landscape:max-h-[44.5svh] xl:landscape:max-h-[60svh] 2xl:landscape:max-h-[44svh] lg:landscape:[@media(max-height:600px)]:max-h-[75svh]"
			style={combinedStyle}
		>
			<header className="flex items-center justify-between">
				<Tooltip className="flex items-center gap-2" content={tip}>
					<div className="flex size-7 items-center justify-center rounded-md bg-(--accent-primary-muted)">
						<Icon className="size-4 text-(--accent-primary)" stroke={2.5} />
					</div>
					{items.length === 1 && (
						<h1 className="trim text-lg font-bold select-none md:mr-auto md:ml-0">{title}</h1>
					)}
				</Tooltip>
				{items.length > 1 && (
					<div
						aria-label="Виджеты слота"
						className="mx-2 flex min-w-0 flex-1 items-center gap-2"
						role="tablist"
					>
						{items.map((item, index) => (
							<div key={item.id} className="flex min-w-0 items-center gap-2">
								{index > 0 && (
									<Divider className="my-auto h-2.5 bg-(--border-primary)" direction="Y" margX="xs" />
								)}
								<Button
									aria-selected={active.id === item.id}
									className={cn(
										'trim text-lg font-bold select-none md:mr-auto md:ml-0',
										active.id === item.id ? 'text-(--text-primary)' : 'text-(--text-secondary)'
									)}
									padding="none"
									role="tab"
									variant="custom"
									onClick={() => setActiveId(item.id)}
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
