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
		<div className="-mt-4 flex flex-col gap-4 pb-4 select-none xl:w-md xl:pb-0">
			<div className="flex gap-2">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/12">
					<IconLayersSelected className="size-5.5 text-(--accent-default)" />
				</div>
				<div className="flex h-full flex-col justify-between gap-0.5 select-none">
					<h2 className="text-xl font-semibold">Заменить виджет</h2>
					<p className="trim text-sm text-(--color-secondary) opacity-60">Подтвердите действие</p>
				</div>
			</div>
			<p className="trim text-sm text-(--color-secondary) opacity-80">
				Выберите виджет, который будет заменён на{' '}
				<span className="text-(--accent-default)">«{targetWidget.title}»</span>
			</p>
			<div className="grid grid-cols-2 gap-2">
				{selected.map((id) => {
					const widget = WIDGETS.find((widget) => widget.id === id);
					if (!widget) return null;

					const { title, icon: Icon } = widget;

					return (
						<button
							key={id}
							className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-(--bg-tertiary) px-3 text-sm text-(--color-secondary) transition hover:scale-[1.03] hover:bg-(--accent-default)/10 hover:text-(--accent-default)"
							type="button"
							onClick={() => onReplace(id)}
						>
							<Icon className="size-4 text-(--accent-default)" />
							<span className="trim">{title}</span>
						</button>
					);
				})}
			</div>
			<Button className="ml-auto h-8" variant="warning" onClick={onCancel}>
				Отмена
			</Button>
		</div>
	);
};
