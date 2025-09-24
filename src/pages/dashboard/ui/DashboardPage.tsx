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
	const { tabsFor, slots, setSlot, EMPTY } = useTabs();

	const widgetById = useMemo(() => new Map(widgets.map((w) => [w.id, w.content] as const)), []);
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
					<WidgetPanel
						content={slotContent(slots.topL)}
						tabs={tabsFor('topL')}
						value={slots.topL}
						onChange={(value) => setSlot('topL', value)}
					/>
					<WidgetPanel
						content={slotContent(slots.topR)}
						tabs={tabsFor('topR')}
						value={slots.topR}
						onChange={(value) => setSlot('topR', value)}
					/>
					<WidgetPanel
						content={slotContent(slots.botL)}
						reverse
						tabs={tabsFor('botL')}
						value={slots.botL}
						onChange={(value) => setSlot('botL', value)}
					/>
					<WidgetPanel
						content={slotContent(slots.botR)}
						reverse
						tabs={tabsFor('botR')}
						value={slots.botR}
						onChange={(value) => setSlot('botR', value)}
					/>
				</div>
			) : (
				<div className="mobile-pad grid grid-cols-1 grid-rows-2 justify-between gap-2">
					<WidgetPanel
						content={slotContent(slots.topL)}
						tabs={tabsFor('topL')}
						value={slots.topL}
						onChange={(value) => setSlot('topL', value)}
					/>
					<WidgetPanel
						content={slotContent(slots.botL)}
						reverse
						tabs={tabsFor('botL')}
						value={slots.botL}
						onChange={(value) => setSlot('botL', value)}
					/>
				</div>
			)}
		</>
	);
};

export default observer(DashboardPage);
