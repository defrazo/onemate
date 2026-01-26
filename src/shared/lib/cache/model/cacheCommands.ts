import type { CurrentType, ForecastType } from '@/widgets/weather';

import type { Cache } from '.';
import { clearCache, readCache, writeCache } from '.';

export const cache = {
	get(id: string): Cache | null {
		return readCache(id);
	},

	getWeather(id: string): { current: CurrentType; forecast: ForecastType[] } | null {
		const c = readCache(id);
		return c?.ui?.weather ?? null;
	},

	setAvatar(id: string, avatar_url: string) {
		writeCache(id, { ui: { avatar_url } });
	},

	setWidgets(id: string, widgets_sequence: string[]) {
		writeCache(id, { ui: { widgets_sequence } });
	},

	setSlots(id: string, widgets_slots: string[]) {
		writeCache(id, { ui: { widgets_slots } });
	},

	setUserId(id: string) {
		writeCache(id, { auth: { user_id: id } });
	},

	setAccountDeleted(id: string, deletedAt: string | null) {
		writeCache(id, { auth: { deleted_at: deletedAt ?? undefined } });
	},

	setWeather(id: string, current: CurrentType, forecast: ForecastType[]) {
		writeCache(id, { ui: { weather: { current, forecast, ts: Date.now() } } });
	},

	clear(id: string) {
		clearCache(id);
	},
};
