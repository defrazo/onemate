import type { UserStore } from '@/entities/user';
import type { Theme } from '@/features/theme-switcher';
import { BaseRouting } from '@/shared/lib/repository';

import type { IUserProfileRepo, UserProfile } from '../../model';
import { ProfileRepoDemo, ProfileRepoSupabase } from '.';

export class ProfileRepoRouting extends BaseRouting implements IUserProfileRepo {
	private readonly realRepo: IUserProfileRepo;
	private readonly demoRepo: IUserProfileRepo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new ProfileRepoSupabase();
		this.demoRepo = new ProfileRepoDemo();
	}

	private getTargetRepo(): IUserProfileRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadProfile(id: string): Promise<UserProfile> {
		this.checkPermission('profile', 'read');
		return this.getTargetRepo().loadProfile(id);
	}

	async updateProfile(id: string, profile: UserProfile): Promise<UserProfile> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateProfile(id, profile);
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateAvatar(id, avatar);
	}

	async updateTheme(id: string, theme: Theme): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateTheme(id, theme);
	}

	async updateWidgets(id: string, widgets: string[]): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateWidgets(id, widgets);
	}

	async markPasswordChanged(id: string): Promise<string | null> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().markPasswordChanged(id);
	}

	async deleteAccount(id: string): Promise<string | null> {
		this.checkPermission('profile', 'delete', 'Удаление аккаунта недоступно в демо-режиме');
		return this.getTargetRepo().deleteAccount(id);
	}

	async restoreAccount(id: string): Promise<void> {
		this.checkPermission('profile', 'save', 'Восстановление аккаунта недоступно в демо-режиме');
		return this.getTargetRepo().restoreAccount(id);
	}
}
