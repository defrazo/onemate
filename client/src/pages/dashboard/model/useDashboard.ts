import { createElement, useEffect, useState } from 'react';
import { type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { useStore } from '@/app/providers';
import { EMPTY_WIDGET_SLOT, type WidgetId, WIDGETS, type WidgetSlot } from '@/shared/config';

import { type SwitcherOption, type WidgetItem, widgets } from '.';
import { normalizeActiveWidgets, readActiveWidgets, saveActiveWidgets } from './dashboardCache';

export const useDashboard = () => {
	const sensors = useSensors(useSensor(PointerSensor));

	const { userProfileStore: store, userStore } = useStore();

	const userId = userStore.id;
	const [selection, setSelection] = useState(() => ({ userId, choices: readActiveWidgets(userId) }));

	const layout = store.widgets;
	const profileMatchesUser = !store.profile?.user_id || store.profile.user_id === userId;
	const activeWidgets = normalizeActiveWidgets(
		layout,
		selection.userId === userId ? selection.choices : readActiveWidgets(userId)
	);

	useEffect(() => {
		if (!userId || userStore.id !== userId || !store.isReady || !profileMatchesUser) return;

		saveActiveWidgets(userId, activeWidgets);

		setSelection((previous) =>
			previous.userId === userId && JSON.stringify(previous.choices) === JSON.stringify(activeWidgets)
				? previous
				: { userId, choices: activeWidgets }
		);
	}, [activeWidgets, userId, userStore, store, store.isReady, profileMatchesUser]);

	const selectWidget = (slot: WidgetId, widget: WidgetId) => {
		if (
			!userId ||
			userStore.id !== userId ||
			!profileMatchesUser ||
			!layout.some((items) => items[0] === slot && items.includes(widget))
		)
			return;

		const choices = { ...activeWidgets, [slot]: widget };

		setSelection({ userId, choices });
		saveActiveWidgets(userId, choices);
	};

	const rowIds = layout.map((slot) => slot[0]);
	const slots = store.slots;

	const widgetMap = new Map<WidgetId, WidgetItem>(widgets.map((widget) => [widget.id, widget]));

	const options: SwitcherOption[] = WIDGETS.map(({ id, icon }) => ({
		value: id,
		label: createElement(icon, { className: 'size-8', stroke: 2 }),
	}));

	const widgetsOrder = layout.map((slot) => slot.map((id) => widgetMap.get(id)!));

	const getSlotContent = (slot: WidgetSlot) => {
		if (slot === EMPTY_WIDGET_SLOT) return null;
		return widgetMap.get(slot)?.content ?? null;
	};

	const setSlot = (idx: number, widgetId: WidgetId) => {
		const newSlots = [...slots];
		const conflictIdx = newSlots.indexOf(widgetId);

		if (conflictIdx !== -1 && conflictIdx !== idx) newSlots[conflictIdx] = EMPTY_WIDGET_SLOT;
		newSlots[idx] = widgetId;

		void store.updateWidgetSlots(newSlots);
	};

	const handleDragEnd = (e: DragEndEvent) => {
		const { active, over } = e;
		if (!over || active.id === over.id) return;

		const activeId = active.id.toString() as WidgetId;
		const overId = over.id.toString() as WidgetId;

		const oldIdx = rowIds.indexOf(activeId);
		const newIdx = rowIds.indexOf(overId);

		if (oldIdx === -1 || newIdx === -1) return;

		void store.updateWidgetSequence(arrayMove(layout, oldIdx, newIdx));
	};

	return {
		sensors,
		rowIds,
		widgetsOrder,
		slots,
		options,
		getSlotContent,
		setSlot,
		handleDragEnd,
		activeWidgets,
		selectWidget,
	};
};
