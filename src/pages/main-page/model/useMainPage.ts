import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { widgets } from '../lib';
import { mainPageStore, WidgetItem } from '.';

export const useMainPage = () => {
	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: any, contextType: 'top' | 'bottom') => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const zone = contextType === 'top' ? mainPageStore.topWidgets : mainPageStore.bottomWidgets;

		const oldIndex = zone.indexOf(active.id);
		const newIndex = zone.indexOf(over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const newZone = arrayMove(zone, oldIndex, newIndex);

		if (contextType === 'top') {
			mainPageStore.setOrderTop(newZone);
		} else {
			mainPageStore.setOrderBottom(newZone);
		}
	};

	const getWidgets = (ids: string[]) =>
		ids.map((id) => widgets.find((w) => w.id === id)).filter(Boolean) as WidgetItem[];

	const topRowIds = mainPageStore.topWidgets;
	const bottomRowIds = mainPageStore.bottomWidgets;

	const topWidgets = getWidgets(topRowIds);
	const bottomWidgets = getWidgets(bottomRowIds);

	return { sensors, handleDragEnd, topRowIds, bottomRowIds, topWidgets, bottomWidgets };
};
