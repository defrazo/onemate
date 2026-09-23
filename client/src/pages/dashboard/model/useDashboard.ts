import { createElement } from 'react';
import { type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { useStore } from '@/app/providers';
import { EMPTY_WIDGET_SLOT, type WidgetId, WIDGETS, type WidgetSlot } from '@/shared/config';

import { type SwitcherOption, type WidgetItem, widgets } from '.';

export const useDashboard = () => {
	const sensors = useSensors(useSensor(PointerSensor));

	const { userProfileStore: store } = useStore();

	const rowIds = store.widgets;
	const slots = store.slots;

	const widgetMap = new Map<WidgetId, WidgetItem>(widgets.map((widget) => [widget.id, widget]));
	const options: SwitcherOption[] = WIDGETS.map(({ id, icon }) => ({
		value: id,
		label: createElement(icon, { className: 'size-7', stroke: 2 }),
	}));

	const widgetsOrder = rowIds
		.map((id) => widgetMap.get(id))
		.filter((widget): widget is WidgetItem => widget !== undefined);

	const getSlotContent = (slot: WidgetSlot) => {
		if (slot === EMPTY_WIDGET_SLOT) return null;
		return widgetMap.get(slot)?.content ?? null;
	};

	const setSlot = (index: number, widgetId: WidgetId) => {
		const newSlots = [...slots];
		const conflictIndex = newSlots.indexOf(widgetId);

		if (conflictIndex !== -1 && conflictIndex !== index) newSlots[conflictIndex] = EMPTY_WIDGET_SLOT;
		newSlots[index] = widgetId;

		void store.updateWidgetSlots(newSlots);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = active.id.toString() as WidgetId;
		const overId = over.id.toString() as WidgetId;

		const oldIndex = rowIds.indexOf(activeId);
		const newIndex = rowIds.indexOf(overId);

		if (oldIndex === -1 || newIndex === -1) return;

		void store.updateWidgetSequence(arrayMove(rowIds, oldIndex, newIndex));
	};

	return { sensors, rowIds, widgetsOrder, slots, options, getSlotContent, setSlot, handleDragEnd };
};
