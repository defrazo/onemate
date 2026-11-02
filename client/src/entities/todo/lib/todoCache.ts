import { readCache, writeCache } from '@/shared/lib/cache';

interface TodoCacheData {
	selectedCanvasId?: string;
	selectedListId?: string;
}

const read = (userId: string): TodoCacheData => {
	const cached = readCache(userId)?.ui?.todo;
	if (!cached || typeof cached !== 'object' || Array.isArray(cached)) return {};

	const data = cached as Record<string, unknown>;

	return {
		...(typeof data.selectedCanvasId === 'string' && { selectedCanvasId: data.selectedCanvasId }),
		...(typeof data.selectedListId === 'string' && { selectedListId: data.selectedListId }),
	};
};

const write = (userId: string, changes: Partial<TodoCacheData>): void => {
	writeCache(userId, { ui: { todo: { ...read(userId), ...changes } } });
};

export const todoCache = {
	readSelectedCanvasId(userId: string): string | null {
		return read(userId).selectedCanvasId ?? null;
	},

	readSelectedListId(userId: string): string | null {
		return read(userId).selectedListId ?? null;
	},

	writeSelectedCanvasId(userId: string, id: string): void {
		write(userId, { selectedCanvasId: id });
	},

	writeSelectedListId(userId: string, id: string): void {
		write(userId, { selectedListId: id });
	},
};
