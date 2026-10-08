import { IconLayersSelected } from '@tabler/icons-react';

import { type WidgetId, WIDGETS } from '@/shared/config';
import { Button } from '@/shared/ui';

interface ReplaceWidgetDialogProps {
	selected: WidgetId[];
	target: WidgetId;
	onCancel: () => void;
	onReplace: (id: WidgetId) => void;
}

export const ReplaceWidgetDialog = ({ selected, target, onCancel, onReplace }: ReplaceWidgetDialogProps) => {
	const targetWidget = WIDGETS.find(({ id }) => id === target);
	if (!targetWidget) return null;

	return (
		<div className="core-gap -mt-4 flex flex-col pb-4 select-none md:pb-0 xl:w-md">
			<div className="flex gap-2">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-(--accent-primary)/12">
					<IconLayersSelected className="size-6 text-(--accent-primary)" />
				</div>
				<div className="flex h-full flex-col justify-between gap-0.5 select-none">
					<h2 className="-mt-0.5 text-xl font-semibold">Заменить виджет</h2>
					<p className="trim text-sm text-(--text-secondary) opacity-60">Подтвердите действие</p>
				</div>
			</div>
			<p className="trim text-sm text-(--text-secondary) opacity-80">
				Выберите виджет, который будет заменён на{' '}
				<span className="text-(--accent-primary)">«{targetWidget.title}»</span>
			</p>
			<div className="grid grid-cols-2 gap-2">
				{selected.map((id) => {
					const widget = WIDGETS.find((widget) => widget.id === id);
					if (!widget) return null;

					const { title, icon: Icon } = widget;

					return (
						<button
							key={id}
							className="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-(--bg-tertiary) px-3 text-sm text-(--text-secondary) transition-[color,background-color,scale] hover:scale-[1.03] hover:bg-(--accent-primary-muted) hover:text-(--accent-primary)"
							type="button"
							onClick={() => onReplace(id)}
						>
							<Icon className="size-4 text-(--accent-primary)" />
							<span className="trim">{title}</span>
						</button>
					);
				})}
			</div>
			<Button className="ml-auto h-7 min-w-24" variant="danger" onClick={onCancel}>
				Отмена
			</Button>
		</div>
	);
};
