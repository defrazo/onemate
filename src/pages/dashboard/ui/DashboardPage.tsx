import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { usePageTitle } from '@/shared/lib/hooks';

import { useDashboard } from '../model';
import { Widget } from '.';

const DashboardPage = () => {
	usePageTitle('Dashboard');

	const { sensors, widgetsOrder, rowIds, handleDragEnd } = useDashboard();

	return (
		<div className="grid flex-1 grid-cols-1 grid-rows-2 gap-4 md:grid-cols-3">
			<DndContext
				collisionDetection={closestCenter}
				modifiers={[restrictToParentElement]}
				sensors={sensors}
				onDragEnd={(e) => handleDragEnd(e)}
			>
				<SortableContext items={rowIds} strategy={rectSortingStrategy}>
					{widgetsOrder.map((widget) => (
						<Widget key={widget.id} content={widget.content} id={widget.id} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default observer(DashboardPage);
