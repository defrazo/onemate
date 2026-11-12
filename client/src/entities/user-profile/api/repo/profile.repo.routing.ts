import type { UserStore } from '@/entities/user';
import type { DashboardLayout, Theme, WidgetSlot } from '@/shared/config';
import { BaseRouting } from '@/shared/lib/repository';

import type { IUserProfileRepo } from '../../model/ports';
import type { UserProfile, UserProfilePatch } from '../../model/types';
import { ProfileRepoDemo } from './profile.repo.demo';
import { ProfileRepoLaravel } from './profile.repo.laravel';

export class ProfileRepoRouting extends BaseRouting implements IUserProfileRepo {
	private readonly realRepo: IUserProfileRepo;
	private readonly demoRepo: IUserProfileRepo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new ProfileRepoLaravel();
		this.demoRepo = new ProfileRepoDemo((id) => this.realRepo.loadProfile(id));
	}

	private getTargetRepo(): IUserProfileRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadProfile(id: string): Promise<UserProfile> {
		this.checkPermission('profile', 'read');
		return this.getTargetRepo().loadProfile(id);
	}

	async updateProfile(id: string, patch: UserProfilePatch): Promise<UserProfile> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateProfile(id, patch);
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateAvatar(id, avatar);
	}

	async updateTheme(id: string, theme: Theme): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateTheme(id, theme);
	}

	async updateNotification(id: string, patch: UserProfilePatch): Promise<UserProfile> {
		this.checkPermission('profile', 'configure');
		return this.getTargetRepo().updateNotification(id, patch);
	}

	async updateWidgets(id: string, widgets: DashboardLayout): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateWidgets(id, widgets);
	}

	async updateSlots(id: string, slots: WidgetSlot[]): Promise<void> {
		this.checkPermission('profile', 'save');
		return this.getTargetRepo().updateSlots(id, slots);
	}
}
