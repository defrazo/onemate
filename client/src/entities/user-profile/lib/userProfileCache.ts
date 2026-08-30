import { readCache, writeCache } from '@/shared/lib/cache';

import type { UserProfile } from '../model';

export type UserProfileCacheData = Pick<UserProfile, 'avatar_url' | 'widgets_sequence' | 'widgets_slots'>;

const patch = (userId: string, data: Partial<UserProfileCacheData>): void => {
	writeCache(userId, {
		ui: data,
	});
};

export const userProfileCache = {
	read(userId: string): Partial<UserProfileCacheData> | null {
		const ui = readCache(userId)?.ui;
		if (!ui) return null;

		return {
			avatar_url: ui.avatar_url as UserProfileCacheData['avatar_url'] | undefined,
			widgets_sequence: ui.widgets_sequence as UserProfileCacheData['widgets_sequence'] | undefined,
			widgets_slots: ui.widgets_slots as UserProfileCacheData['widgets_slots'] | undefined,
		};
	},

	patch,

	setAvatar(userId: string, avatarUrl: UserProfile['avatar_url']): void {
		patch(userId, {
			avatar_url: avatarUrl,
		});
	},

	setWidgets(userId: string, widgets: UserProfile['widgets_sequence']): void {
		patch(userId, {
			widgets_sequence: widgets,
		});
	},

	setSlots(userId: string, slots: UserProfile['widgets_slots']): void {
		patch(userId, {
			widgets_slots: slots,
		});
	},

	sync(userId: string, profile: UserProfile): void {
		patch(userId, {
			avatar_url: profile.avatar_url,
			widgets_sequence: profile.widgets_sequence,
			widgets_slots: profile.widgets_slots,
		});
	},
};
