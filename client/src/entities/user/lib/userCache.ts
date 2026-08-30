import { readCache, writeCache } from '@/shared/lib/cache';

export type UserCacheData = {
	user_id?: string;
	deleted_at?: string;
};

const patch = (userId: string, data: UserCacheData): void => {
	writeCache(userId, {
		auth: data,
	});
};

export const userCache = {
	read(userId: string): UserCacheData | null {
		const auth = readCache(userId)?.auth;
		if (!auth) return null;

		return {
			user_id: auth.user_id as string | undefined,
			deleted_at: auth.deleted_at as string | undefined,
		};
	},

	setUserId(userId: string): void {
		patch(userId, {
			user_id: userId,
		});
	},

	setDeletedAt(userId: string, deletedAt: string | null): void {
		patch(userId, {
			deleted_at: deletedAt ?? undefined,
		});
	},
};
