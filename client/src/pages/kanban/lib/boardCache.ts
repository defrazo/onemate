import type { KanbanBoard, KanbanSnapshot } from '../model';

const CACHE_TTL = 5 * 60 * 1000;

type Cache = {
	boards: KanbanBoard[];
	activeBoardId: string;
	snapshots: Map<string, KanbanSnapshot>;
	updatedAt: number;
};

let cache: Cache | null = null;

export const boardCache = {
	get(): Cache | null {
		if (!cache) return null;

		if (Date.now() - cache.updatedAt > CACHE_TTL) {
			cache = null;
			return null;
		}

		return structuredClone(cache);
	},

	set(boards: KanbanBoard[], activeBoardId: string, snapshots: Map<string, KanbanSnapshot>) {
		cache = structuredClone({ boards, activeBoardId, snapshots, updatedAt: Date.now() });
	},

	clear() {
		cache = null;
	},
};
