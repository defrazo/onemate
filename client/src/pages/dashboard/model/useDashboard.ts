import { type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { useStore } from '@/app/providers';

import { widgets } from '../lib';
import type { WidgetItem } from '.';

export const useDashboard = () => {
	const sensors = useSensors(useSensor(PointerSensor));

	const { userProfileStore: store } = useStore();

	const handleDragEnd = (e: DragEndEvent) => {
		const { active, over } = e;
		if (!over || active.id === over.id) return;

		const activeId = active.id.toString();
		const overId = over.id.toString();

		const oldIndex = store.widgets.indexOf(activeId);
		const newIndex = store.widgets.indexOf(overId);

		if (oldIndex === -1 || newIndex === -1) return;

		const newOrder = arrayMove(store.widgets, oldIndex, newIndex);
		store.updateWidgetSequence(newOrder);
	};

	const getWidgets = (ids: string[]) =>
		ids.map((id) => widgets.find((w) => w.id === id)).filter(Boolean) as WidgetItem[];

	const rowIds = store.widgets;
	const widgetsOrder = getWidgets(rowIds);

	return { sensors, rowIds, widgetsOrder, handleDragEnd };
};
