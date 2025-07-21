import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useDashboard } from '../model';
import { Widget } from '.';

const DashboardPage = () => {
	const { sensors, handleDragEnd, topWidgets, bottomWidgets, topRowIds, bottomRowIds } = useDashboard();

	return (
		<div className="flex size-full flex-col gap-4">
			<DndContext
				collisionDetection={closestCenter}
				modifiers={[restrictToParentElement]}
				sensors={sensors}
				onDragEnd={(e) => handleDragEnd(e, 'top')}
			>
				<SortableContext items={topRowIds} strategy={rectSortingStrategy}>
					<div className="grid h-full min-h-fit grid-cols-3 gap-4">
						{topWidgets.map((widget) => (
							<Widget key={widget.id} id={widget.id}>
								<div className="size-full">{widget.content}</div>
							</Widget>
						))}
					</div>
				</SortableContext>
			</DndContext>
			<DndContext
				collisionDetection={closestCenter}
				modifiers={[restrictToParentElement]}
				sensors={sensors}
				onDragEnd={(e) => handleDragEnd(e, 'bottom')}
			>
				<SortableContext items={bottomRowIds} strategy={rectSortingStrategy}>
					<div className="grid h-full min-h-fit grid-cols-3 gap-4">
						{bottomWidgets.map((widget) => (
							<Widget key={widget.id} id={widget.id}>
								<div className="size-full">{widget.content}</div>
							</Widget>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default observer(DashboardPage);
