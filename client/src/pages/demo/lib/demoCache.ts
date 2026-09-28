import { readCache, writeCache } from '@/shared/lib/cache';

export const demoCache = {
	isClosed(userId: string) {
		return readCache(userId)?.ui?.demoBannerClosed === true;
	},

	close(userId: string) {
		writeCache(userId, { ui: { demoBannerClosed: true } });
	},
};
