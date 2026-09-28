import { readCache, writeCache } from '@/shared/lib/cache';

export const demoCache = {
	isClosed(userId: string): boolean {
		return readCache(userId)?.ui?.demoBannerClosed === true;
	},

	close(userId: string): void {
		writeCache(userId, { ui: { demoBannerClosed: true } });
	},
};
