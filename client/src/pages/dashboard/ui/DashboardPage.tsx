import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { usePageTitle, useResponsive } from '@/shared/lib/hooks';

import { useDashboard } from '../model';
import { Slot, Widget } from './components';

export const DashboardPage = observer(() => {
	usePageTitle('Dashboard');

	const { isDesktop, isTablet, isLandscape } = useResponsive();

	const { sensors, rowIds, widgetsOrder, slots, options, getSlotContent, setSlot, handleDragEnd } = useDashboard();

	return (
		<>
			{isDesktop || (isTablet && isLandscape) ? (
				<div className="core-gap grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 md:grid-rows-3 lg:grid-cols-3 lg:grid-rows-2">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToParentElement]}
						sensors={sensors}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={rowIds} strategy={rectSortingStrategy}>
							{widgetsOrder.map((widget) => (
								<Widget key={widget.id} {...widget} />
							))}
						</SortableContext>
					</DndContext>
				</div>
			) : isTablet ? (
				<div className="core-gap grid min-h-0 flex-1 grid-cols-2">
					{slots.map((slot, idx) => (
						<Slot
							key={idx}
							content={getSlotContent(slot)}
							options={options}
							reverse={idx === 2 || idx === 3}
							value={slot}
							onChange={(value) => setSlot(idx, value)}
						/>
					))}
				</div>
			) : (
				<div className="core-gap grid w-full grid-cols-1">
					{slots.slice(0, 2).map((slot, idx) => (
						<Slot
							key={idx}
							className="min-h-[65svh]"
							content={getSlotContent(slot)}
							options={options}
							reverse={idx === 1}
							value={slot}
							onChange={(value) => setSlot(idx, value)}
						/>
					))}
				</div>
			)}
		</>
	);
});
