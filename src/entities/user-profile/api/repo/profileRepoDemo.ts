import type { Theme } from '@/features/theme-switcher';
import { createDemoProfile } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserProfileRepo, UserProfile } from '../../model';

export class ProfileRepoDemo implements IUserProfileRepo {
	async loadProfile(id: string): Promise<UserProfile> {
		const stored = storage.get(key(id, 'profile'));
		if (stored && typeof stored === 'object') return structuredClone(stored);

		const demoProfile = createDemoProfile();
		storage.set(key(id, 'profile'), demoProfile);
		return demoProfile;
	}

	async updateProfile(id: string, profile: UserProfile): Promise<UserProfile> {
		storage.set(key(id, 'profile'), toPlain(profile));
		return structuredClone(profile);
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		const stored = storage.get(key(id, 'profile'));
		const base = stored && typeof stored === 'object' ? stored : createDemoProfile();

		storage.set(key(id, 'profile'), toPlain({ ...base, avatar_url: avatar }));
	}

	async updateTheme(id: string, theme: Theme): Promise<void> {
		const stored = storage.get(key(id, 'profile'));
		const base = stored && typeof stored === 'object' ? stored : createDemoProfile();

		storage.set(key(id, 'profile'), toPlain({ ...base, theme }));
	}

	async updateWidgets(id: string, widgets: string[]): Promise<void> {
		const stored = storage.get(key(id, 'profile'));
		const base = stored && typeof stored === 'object' ? stored : createDemoProfile();

		storage.set(key(id, 'profile'), toPlain({ ...base, widgets_sequence: widgets }));
	}

	async updateSlots(id: string, slots: string[]): Promise<void> {
		const stored = storage.get(key(id, 'profile'));
		const base = stored && typeof stored === 'object' ? stored : createDemoProfile();

		storage.set(key(id, 'profile'), toPlain({ ...base, widgets_slots: slots }));
	}

	async markPasswordChanged(id: string): Promise<string | null> {
		const stored = storage.get(key(id, 'profile'));
		const base = stored && typeof stored === 'object' ? stored : createDemoProfile();

		const iso = new Date().toISOString();
		storage.set(key(id, 'profile'), toPlain({ ...base, password_changed_at: iso }));
		return iso;
	}

	async deleteAccount(_id: string): Promise<string | null> {
		return null;
	}

	async restoreAccount(_id: string): Promise<void> {
		return;
	}
}
