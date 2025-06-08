import { useState } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { IconWidgets } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { Button, SortableWidget } from '@/shared/ui';

import { widgetStore } from '../model';

type WidgetItem = {
	id: string;
	content: React.ReactNode;
};

type DashboardProps = {
	widgets: WidgetItem[];
	onOrderChange?: (newOrder: string[]) => void;
};

export const Dashboard = observer(({ widgets: allWidgets, onOrderChange }: DashboardProps) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: any) => {
		// console.log('drag ended', event);
		if (!isEditMode) return;

		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = widgetStore.widgets.findIndex((id) => id === active.id);
			const newIndex = widgetStore.widgets.findIndex((id) => id === over.id);
			const newOrder = arrayMove(widgetStore.widgets, oldIndex, newIndex);
			widgetStore.setOrder(newOrder);
			onOrderChange?.(newOrder);
		}
	};

	const sortedWidgets = widgetStore.widgets
		.map((id) => allWidgets.find((w) => w.id === id))
		.filter(Boolean) as WidgetItem[];

	// Делим на три колонки, по 2 виджета в каждой (если 6 всего)
	const columnCount = 3;
	const widgetsPerColumn = Math.ceil(sortedWidgets.length / columnCount);
	const columns = Array.from({ length: columnCount }, (_, i) =>
		sortedWidgets.slice(i * widgetsPerColumn, (i + 1) * widgetsPerColumn)
	);

	return (
		<DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
			<SortableContext items={widgetStore.widgets} strategy={rectSortingStrategy}>
				<div className="relative flex min-w-full flex-1 gap-4">
					<Button
						centerIcon={<IconWidgets className="size-5" />}
						className={cn(
							'absolute top-0 right-0 bg-transparent p-2 opacity-20 transition hover:bg-transparent hover:opacity-100 active:bg-transparent',
							isEditMode && 'text-[var(--accent-hover)] opacity-100'
						)}
						size="custom"
						title={isEditMode ? 'Завершить редактирование' : 'Редактировать виджеты'}
						variant="mobile"
						onClick={() => setIsEditMode((prev) => !prev)}
					/>

					{/* 3 колонки */}
					{columns.map((colWidgets, colIndex) => (
						<div key={colIndex} className="flex w-full flex-col justify-between gap-4">
							{/* <div key={colIndex} className="flex flex-1 flex-col justify-between gap-4"> */}
							{colWidgets.map((widget) => (
								<SortableWidget key={widget.id} disabled={!isEditMode} id={widget.id}>
									{widget.content as React.ReactElement}
								</SortableWidget>
							))}
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
});
