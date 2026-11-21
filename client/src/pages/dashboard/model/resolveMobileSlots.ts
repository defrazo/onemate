import type { WidgetId, WidgetSlot } from '@/entities/user-profile';
import { EMPTY_WIDGET_SLOT } from '@/shared/config';

export const resolveMobileSlots = (slots: readonly WidgetSlot[], enabled: readonly WidgetId[]): WidgetSlot[] => {
	const allowed = new Set(enabled);
	const occupied = new Set(slots.filter((id): id is WidgetId => id !== EMPTY_WIDGET_SLOT && allowed.has(id)));

	return slots.map((id) => {
		if (id === EMPTY_WIDGET_SLOT || allowed.has(id)) return id;

		const replacement = enabled.find((candidate) => !occupied.has(candidate));
		if (!replacement) return EMPTY_WIDGET_SLOT;

		occupied.add(replacement);
		return replacement;
	});
};
