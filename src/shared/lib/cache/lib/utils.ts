import { LS_PREFIX } from '@/shared/lib/storage';

import type { Cache } from '../model';

export const key = (id: string) => `${LS_PREFIX}cache_${id}`;

export const cleanup = (cache: Cache): Cache => {
	const out: Cache = { ts: cache.ts };

	if (cache.ui) {
		const ui: NonNullable<Cache['ui']> = {};
		if (cache.ui.widgets_sequence !== undefined) ui.widgets_sequence = cache.ui.widgets_sequence;
		if (cache.ui.widgets_slots !== undefined) ui.widgets_slots = cache.ui.widgets_slots;
		if (cache.ui.avatar_url !== undefined) ui.avatar_url = cache.ui.avatar_url;
		if (Object.keys(ui).length) out.ui = ui;
	}

	if (cache.auth) {
		const auth: NonNullable<Cache['auth']> = {};
		if (cache.auth.user_id !== undefined) auth.user_id = cache.auth.user_id;
		if (cache.auth.deleted_at !== undefined) auth.deleted_at = cache.auth.deleted_at;
		if (Object.keys(auth).length) out.auth = auth;
	}

	return out;
};
