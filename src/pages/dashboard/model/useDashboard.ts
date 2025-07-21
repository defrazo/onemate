import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { widgets } from '../lib';
import { dashboardStore, WidgetItem } from '.';

export const useDashboard = () => {
	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: any, contextType: 'top' | 'bottom') => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const zone = contextType === 'top' ? dashboardStore.topWidgets : dashboardStore.bottomWidgets;

		const oldIndex = zone.indexOf(active.id);
		const newIndex = zone.indexOf(over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const newZone = arrayMove(zone, oldIndex, newIndex);

		if (contextType === 'top') {
			dashboardStore.setOrderTop(newZone);
		} else {
			dashboardStore.setOrderBottom(newZone);
		}
	};

	const getWidgets = (ids: string[]) =>
		ids.map((id) => widgets.find((w) => w.id === id)).filter(Boolean) as WidgetItem[];

	const topRowIds = dashboardStore.topWidgets;
	const bottomRowIds = dashboardStore.bottomWidgets;

	const topWidgets = getWidgets(topRowIds);
	const bottomWidgets = getWidgets(bottomRowIds);

	return { sensors, handleDragEnd, topRowIds, bottomRowIds, topWidgets, bottomWidgets };
};
