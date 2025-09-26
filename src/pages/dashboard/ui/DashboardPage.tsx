import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useDeviceType, useOrientation, usePageTitle } from '@/shared/lib/hooks';

import { widgets } from '../lib';
import { useDashboard, useTabs } from '../model';
import { Widget, WidgetPanel } from '.';
import { useMemo } from 'react';

const DashboardPage = () => {
	usePageTitle('Dashboard');
	const device = useDeviceType();
	const orientation = useOrientation();

	const { sensors, widgetsOrder, rowIds, handleDragEnd } = useDashboard();
	const { slots, setSlot, tabsFor, EMPTY } = useTabs();

	const widgetById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget.content] as const)), []);
	const slotContent = (id: string | undefined) => (id === EMPTY ? null : (widgetById.get(id ?? '') ?? null));

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
								<Widget key={widget.id} content={widget.content} id={widget.id} />
							))}
						</SortableContext>
					</DndContext>
				</div>
			) : device === 'tablet' ? (
				<div className="mobile-pad grid grid-cols-2 grid-rows-2 justify-evenly gap-x-2 gap-y-8 py-4">
					{slots.map((slot, index) => (
						<WidgetPanel
							key={index}
							content={slotContent(slot)}
							tabs={tabsFor()}
							value={slot}
							reverse={index === 2 || index === 3}
							onChange={(value) => setSlot(index, value)}
						/>
					))}
				</div>
			) : (
				<div className="mobile-pad grid grid-cols-1 grid-rows-2 justify-between gap-2">
					{slots.slice(0, 2).map((slot, index) => (
						<WidgetPanel
							key={index}
							content={slotContent(slot)}
							tabs={tabsFor()}
							value={slot}
							reverse={index === 1}
							onChange={(value) => setSlot(index, value)}
						/>
					))}
				</div>
			)}
		</>
	);
};

export default observer(DashboardPage);
