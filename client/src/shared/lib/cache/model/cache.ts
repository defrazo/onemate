import { storage } from '@/shared/lib/storage';

import { cleanup, key } from '../lib';
import type { Cache, Patch } from '.';

export const readCache = (id: string): Cache | null => {
	const raw = storage.get(key(id)) as Cache | null;
	if (!raw) return null;

	return raw;
};

export const writeCache = (id: string, patch: Patch): void => {
	const prev = (storage.get(key(id)) as Cache | null) ?? { ts: 0 };
	const merged: Cache = cleanup({
		ts: Date.now(),
		ui: { ...(prev.ui ?? {}), ...(patch.ui ?? {}) },
		auth: { ...(prev.auth ?? {}), ...(patch.auth ?? {}) },
	});
	storage.set(key(id), merged);
};

export const clearCache = (id: string): void => {
	storage.remove(key(id));
};
