import type { Cache } from '.';
import { clearCache, readCache, writeCache } from '.';

export const cache = {
	get(id: string): Cache | null {
		return readCache(id);
	},

	setAvatar(id: string, avatar_url: string) {
		writeCache(id, { ui: { avatar_url } });
	},

	setWidgets(id: string, widgets_sequence: string[]) {
		writeCache(id, { ui: { widgets_sequence } });
	},

	setUserId(id: string) {
		writeCache(id, { auth: { user_id: id } });
	},

	setAccountDeleted(id: string, deletedAt: string | null) {
		writeCache(id, { auth: { deleted_at: deletedAt ?? undefined } });
	},

	clear(id: string) {
		clearCache(id);
	},
};
