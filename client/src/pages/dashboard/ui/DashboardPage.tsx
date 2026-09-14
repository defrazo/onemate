import { useMemo } from 'react';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useDeviceType, useOrientation, usePageTitle } from '@/shared/lib/hooks';

import { useDashboard, useTabs, widgets } from '../model';
import { Widget, WidgetPanel } from './components';

export const DashboardPage = observer(() => {
	const device = useDeviceType();
	const orientation = useOrientation();

	usePageTitle('Dashboard');

	const { sensors, widgetsOrder, rowIds, handleDragEnd } = useDashboard();
	const { slots, setSlot, tabsFor, EMPTY } = useTabs();

	const widgetById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), []);

	const slotContent = (id: string | undefined) => {
		if (id === EMPTY || !id) return null;
		return widgetById.get(id)?.content ?? null;
	};

	return (
		<>
			{device === 'desktop' || (device === 'tablet' && orientation === 'landscape') ? (
				<div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3 lg:grid-cols-3 lg:grid-rows-2">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToParentElement]}
						sensors={sensors}
						onDragEnd={(e) => handleDragEnd(e)}
					>
						<SortableContext items={rowIds} strategy={rectSortingStrategy}>
							{widgetsOrder.map((widget) => (
								<Widget key={widget.id} {...widget} />
							))}
						</SortableContext>
					</DndContext>
				</div>
			) : device === 'tablet' ? (
				<div className="grid grid-cols-2 grid-rows-2 justify-evenly gap-4">
					{slots.map((slot, idx) => (
						<WidgetPanel
							key={idx}
							content={slotContent(slot)}
							reverse={idx === 2 || idx === 3}
							tabs={tabsFor()}
							value={slot}
							onChange={(value) => setSlot(idx, value)}
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 grid-rows-2 justify-between gap-2">
					{slots.slice(0, 2).map((slot, idx) => (
						<WidgetPanel
							key={idx}
							content={slotContent(slot)}
							reverse={idx === 1}
							tabs={tabsFor()}
							value={slot}
							onChange={(value) => setSlot(idx, value)}
						/>
					))}
				</div>
			)}
		</>
	);
});
