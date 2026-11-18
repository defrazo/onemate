import {
	type DashboardLayout,
	normalizeDashboardLayout,
	normalizeWidgetSlots,
	type Theme,
	type WidgetId,
	type WidgetSlot,
} from '@/shared/config';
import { RestrictedAccess } from '@/shared/lib/errors';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserProfileRepo } from '../../model/ports';
import type { UserProfile, UserProfilePatch } from '../../model/types';

export class ProfileRepoDemo implements IUserProfileRepo {
	constructor(private readonly loadInitialProfile: (id: string) => Promise<UserProfile>) {}

	async loadProfile(id: string): Promise<UserProfile> {
		const stored = storage.get(key(id, 'profile'));
		const hasStored = stored && typeof stored === 'object';
		const profile = hasStored ? (stored as UserProfile) : await this.loadInitialProfile(id);
		const normalized = {
			...profile,
			widgets_sequence: normalizeDashboardLayout(profile.widgets_sequence),
			widgets_slots: normalizeWidgetSlots(profile.widgets_slots),
		};

		if (!hasStored) storage.set(key(id, 'profile'), toPlain(normalized));
		return structuredClone(normalized);
	}

	async updateProfile(id: string, patch: UserProfilePatch): Promise<UserProfile> {
		const profile = await this.loadProfile(id);
		const updated = { ...profile, ...patch };

		storage.set(key(id, 'profile'), toPlain(updated));

		return structuredClone(updated);
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, avatar_url: avatar }));
	}

	async updateTheme(id: string, theme: Theme): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, theme }));
	}

	async updateNotification(_id: string, _patch: UserProfilePatch): Promise<UserProfile> {
		throw new RestrictedAccess();
	}

	async updateWidgets(id: string, widgets: DashboardLayout): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, widgets_sequence: widgets }));
	}

	async updateMobileWidgets(id: string, widgets: WidgetId[]): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, mobile_widgets: widgets }));
	}

	async updateSlots(id: string, slots: WidgetSlot[]): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, widgets_slots: slots }));
	}
}
