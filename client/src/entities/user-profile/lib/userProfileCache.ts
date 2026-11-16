import { normalizeDashboardLayout, normalizeWidgetSlots } from '@/shared/config';
import { readCache, writeCache } from '@/shared/lib/cache';

import type { UserProfile } from '../model/types';

export type UserProfileCacheData = Pick<UserProfile, 'avatar_url' | 'widgets_sequence' | 'widgets_slots'>;
export type PendingProfileData = Partial<UserProfileCacheData & Pick<UserProfile, 'theme'>>;

const patch = (userId: string, data: Partial<UserProfileCacheData>) => {
	writeCache(userId, { ui: { profile_pending: { ...userProfileCache.readPending(userId), ...data } } });
};

export const userProfileCache = {
	read(userId: string): Partial<UserProfileCacheData> | null {
		const cached = readCache(userId)?.ui;

		const ui =
			cached?.profile_confirmed &&
			typeof cached.profile_confirmed === 'object' &&
			!Array.isArray(cached.profile_confirmed)
				? (cached.profile_confirmed as Record<string, unknown>)
				: cached;

		if (!ui) return null;

		return {
			avatar_url: ui.avatar_url as UserProfileCacheData['avatar_url'] | undefined,
			widgets_sequence:
				ui.widgets_sequence === undefined ? undefined : normalizeDashboardLayout(ui.widgets_sequence),
			widgets_slots: ui.widgets_slots === undefined ? undefined : normalizeWidgetSlots(ui.widgets_slots),
		};
	},

	patch,

	readPending(userId: string): PendingProfileData {
		const value = readCache(userId)?.ui?.profile_pending;
		if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

		const data = value as Record<string, unknown>;

		return {
			...(typeof data.avatar_url === 'string' && { avatar_url: data.avatar_url }),
			...(Array.isArray(data.widgets_sequence) && {
				widgets_sequence: normalizeDashboardLayout(data.widgets_sequence),
			}),
			...(Array.isArray(data.widgets_slots) && { widgets_slots: normalizeWidgetSlots(data.widgets_slots) }),
			...((data.theme === 'light' || data.theme === 'dark') && { theme: data.theme }),
		};
	},

	setTheme(userId: string, theme: UserProfile['theme']) {
		writeCache(userId, { ui: { profile_pending: { ...this.readPending(userId), theme } } });
	},

	confirm(userId: string, saved: PendingProfileData) {
		const pending = this.readPending(userId);
		const confirmed = readCache(userId)?.ui?.profile_confirmed;
		const previous = confirmed && typeof confirmed === 'object' && !Array.isArray(confirmed) ? confirmed : {};

		for (const field of Object.keys(saved) as (keyof PendingProfileData)[]) {
			if (JSON.stringify(pending[field]) === JSON.stringify(saved[field])) delete pending[field];
		}

		writeCache(userId, {
			ui: {
				profile_confirmed: { ...previous, ...saved },
				profile_pending: Object.keys(pending).length ? pending : undefined,
			},
		});
	},

	setAvatar(userId: string, avatarUrl: UserProfile['avatar_url']) {
		patch(userId, { avatar_url: avatarUrl });
	},

	setWidgets(userId: string, widgets: UserProfile['widgets_sequence']) {
		patch(userId, { widgets_sequence: widgets });
	},

	setSlots(userId: string, slots: UserProfile['widgets_slots']) {
		patch(userId, { widgets_slots: slots });
	},

	sync(userId: string, profile: UserProfile) {
		writeCache(userId, {
			ui: {
				profile_confirmed: {
					avatar_url: profile.avatar_url,
					widgets_sequence: normalizeDashboardLayout(profile.widgets_sequence),
					widgets_slots: normalizeWidgetSlots(profile.widgets_slots),
				},
			},
		});
	},
};
