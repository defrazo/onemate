import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useIsMobile, usePageTitle } from '@/shared/lib/hooks';
import { TabSlider } from '@/shared/ui';

import { widgets } from '../lib';
import { useDashboard, useTabs } from '../model';
import { Widget } from '.';

const DashboardPage = () => {
	usePageTitle('Dashboard');
	const isMobile = useIsMobile();

	const { sensors, widgetsOrder, rowIds, handleDragEnd } = useDashboard();
	const { tabTop, tabsTop, tabBottom, tabsBottom, handleTopChange, handleBottomChange } = useTabs();

	return (
		<>
			{!isMobile ? (
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
			) : (
				<div className="mobile-pad flex flex-col justify-between gap-2">
					<div className="core-base flex flex-col gap-2 rounded-xl p-2">
						<TabSlider
							className="rounded-xl border-[var(--border-color)] bg-[var(--bg-primary)] p-1"
							tabs={tabsTop}
							value={tabTop}
							onChange={handleTopChange}
						/>
						<div className="relative flex min-h-[40dvh] flex-1 flex-col justify-between gap-2 shadow-[var(--shadow)] select-none">
							{(() => {
								const widget = widgets.find((widget) => widget.id === tabTop);
								return widget ? widget.content : <div>Виджет не найден</div>;
							})()}
						</div>
					</div>
					<div className="core-base flex flex-col gap-2 rounded-xl p-2">
						<div className="relative flex min-h-[40dvh] flex-1 flex-col justify-between gap-2 shadow-[var(--shadow)] select-none">
							{(() => {
								const widget = widgets.find((widget) => widget.id === tabBottom);
								return widget ? widget.content : <div>Виджет не найден</div>;
							})()}
						</div>
						<TabSlider
							className="rounded-xl border-[var(--border-color)] bg-[var(--bg-primary)] p-1"
							tabs={tabsBottom}
							value={tabBottom}
							onChange={handleBottomChange}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default observer(DashboardPage);
