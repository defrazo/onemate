import type { Theme } from '@/shared/config';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserProfileRepo, UserProfile, UserProfilePatch } from '../../model';

export class ProfileRepoDemo implements IUserProfileRepo {
	constructor(private readonly loadInitialProfile: (id: string) => Promise<UserProfile>) {}

	async loadProfile(id: string): Promise<UserProfile> {
		const stored = storage.get(key(id, 'profile'));
		if (stored && typeof stored === 'object') return structuredClone(stored as UserProfile);

		const initial = await this.loadInitialProfile(id);
		storage.set(key(id, 'profile'), toPlain(initial));
		return structuredClone(initial);
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

	async updateWidgets(id: string, widgets: string[]): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, widgets_sequence: widgets }));
	}

	async updateSlots(id: string, slots: string[]): Promise<void> {
		const profile = await this.loadProfile(id);
		storage.set(key(id, 'profile'), toPlain({ ...profile, widgets_slots: slots }));
	}

	async markPasswordChanged(id: string): Promise<string | null> {
		const profile = await this.loadProfile(id);
		const iso = new Date().toISOString();

		storage.set(key(id, 'profile'), toPlain({ ...profile, password_changed_at: iso }));

		return iso;
	}

	async deleteAccount(_id: string): Promise<string | null> {
		return null;
	}

	async restoreAccount(_id: string): Promise<void> {
		return;
	}
}
