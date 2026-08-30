import { action, computed, makeObservable, observable, reaction } from 'mobx';

import { type City, isSameCity } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { IUserLocationRepo } from '@/entities/user-location';
import { AVATAR_ENTRIES, AvatarId, AVATARS } from '@/shared/assets/images/avatars';
import { DEFAULT_THEME, type Theme } from '@/shared/config';
import { handleError } from '@/shared/lib/errors';
import { AsyncStore, Debouncer } from '@/shared/lib/store';

import { userProfileCache, type UserProfileCacheData } from '../lib';
import type { Gender, IUserProfileProfilePort, IUserProfileRepo, IUserProfileThemePort, UserProfile } from '.';
import { createDefaultProfile, createDefaultSlots, createDefaultWidgets } from '.';

export class UserProfileStore extends AsyncStore implements IUserProfileProfilePort, IUserProfileThemePort {
	private readonly avatarUpdate = new Debouncer();
	private readonly themeUpdate = new Debouncer();
	private readonly widgetSequenceUpdate = new Debouncer();
	private readonly widgetSlotsUpdate = new Debouncer();
	private readonly locationUpdate = new Debouncer();

	profile: UserProfile | null = null;

	private currentLocation: City | null = null;
	private profileReady = false;
	private locationReady = false;

	get isReady(): boolean {
		return this.profileReady;
	}

	get isLocationReady(): boolean {
		return this.locationReady;
	}

	get location(): City | null {
		return this.currentLocation;
	}

	get locationName(): string {
		return this.currentLocation?.name ?? '';
	}

	get locationRegion(): string {
		return this.currentLocation?.region ?? '';
	}

	get avatarId(): AvatarId {
		const avatarUrl = this.profile?.avatar_url;
		if (!avatarUrl) return 'avatar0';

		return AVATAR_ENTRIES.find(([, url]) => url === avatarUrl)?.[0] ?? 'avatar0';
	}

	get avatar(): string {
		return AVATARS[this.avatarId];
	}

	get firstName(): string {
		return this.profile?.first_name ?? '';
	}

	get lastName(): string {
		return this.profile?.last_name ?? '';
	}

	get birthDate(): string | null {
		return this.profile?.birth_date ?? null;
	}

	get birthYear(): string {
		return this.profile?.birth_date?.split('-')[0] ?? '';
	}

	get birthMonth(): string {
		const month = this.profile?.birth_date?.split('-')[1];
		return month ? String(Number(month)) : '';
	}

	get birthDay(): string {
		const day = this.profile?.birth_date?.split('-')[2];
		return day ? String(Number(day)) : '';
	}

	get gender(): Gender {
		return this.profile?.gender ?? '';
	}

	get phone(): string[] {
		return this.profile?.phones ?? [''];
	}

	get email(): string[] {
		return this.profile?.additional_emails ?? [''];
	}

	get theme(): Theme {
		return this.profile?.theme ?? DEFAULT_THEME;
	}

	get widgets(): string[] {
		return this.profile?.widgets_sequence ?? createDefaultWidgets();
	}

	get slots(): string[] {
		return this.profile?.widgets_slots ?? createDefaultSlots();
	}

	get passwordChangedAt(): string | null {
		return this.profile?.password_changed_at ?? null;
	}

	private async load(userId: string): Promise<void> {
		if (this.isLoading) return;

		await this.withLoading(async () => {
			const cachedProfile = userProfileCache.read(userId);

			const results = await Promise.allSettled([
				this.loadProfile(userId, cachedProfile),
				this.loadLocation(userId),
			]);

			for (const result of results) {
				if (result.status === 'rejected') handleError(result.reason);
			}
		});
	}

	private async loadProfile(userId: string, cached?: Partial<UserProfileCacheData> | null): Promise<void> {
		const server = await this.repo.loadProfile(userId);

		const profile: UserProfile = { ...createDefaultProfile(), ...server, ...this.resolveCachedProfile(cached) };

		this.applyProfile(profile);
		userProfileCache.sync(userId, profile);
	}

	private async loadLocation(userId: string): Promise<void> {
		const location = await this.locationRepo.load(userId);

		this.applyLocation(location);
	}

	async updateProfile(profile: UserProfile): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		await this.withLoading(async () => {
			const normalizedProfile: UserProfile = {
				...profile,
				phones: (profile.phones ?? []).map((phone) => phone.trim()).filter(Boolean),
				additional_emails: (profile.additional_emails ?? []).map((email) => email.trim()).filter(Boolean),
			};

			const updated = await this.repo.updateProfile(userId, normalizedProfile);

			const nextProfile = { ...createDefaultProfile(), ...updated };

			this.applyProfile(nextProfile);
			userProfileCache.sync(userId, nextProfile);
		});
	}

	async updateAvatar(avatar: string): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.profile?.avatar_url === avatar) return;

		this.patchProfile({ avatar_url: avatar });
		userProfileCache.setAvatar(userId, avatar);

		this.scheduleServerUpdate(this.avatarUpdate, 500, userId, () => this.repo.updateAvatar(userId, avatar));
	}

	async updateTheme(theme: Theme): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.profile?.theme === theme) return;

		this.patchProfile({ theme });

		this.scheduleServerUpdate(this.themeUpdate, 500, userId, () => this.repo.updateTheme(userId, theme));
	}

	async updateWidgetSequence(widgets: string[]): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.arraysEqual(this.profile?.widgets_sequence, widgets)) return;

		this.patchProfile({ widgets_sequence: widgets });
		userProfileCache.setWidgets(userId, widgets);

		this.scheduleServerUpdate(this.widgetSequenceUpdate, 2000, userId, () =>
			this.repo.updateWidgets(userId, widgets)
		);
	}

	async updateWidgetSlots(slots: string[]): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.arraysEqual(this.profile?.widgets_slots, slots)) return;

		this.patchProfile({ widgets_slots: slots });
		userProfileCache.setSlots(userId, slots);

		this.scheduleServerUpdate(this.widgetSlotsUpdate, 2000, userId, () => this.repo.updateSlots(userId, slots));
	}

	async markPasswordChanged(userId: string): Promise<void> {
		const changedAt = await this.repo.markPasswordChanged(userId);

		this.patchProfile({ password_changed_at: changedAt });
	}

	setLocation(city: City): void {
		if (this.currentLocation && isSameCity(this.currentLocation, city)) return;

		const userId = this.userStore.id;
		this.applyLocation(city);
		if (!userId) return;

		this.scheduleServerUpdate(this.locationUpdate, 500, userId, () => this.locationRepo.save(userId, city));
	}

	async deleteLocation(): Promise<void> {
		const userId = this.userStore.id;

		this.locationUpdate.cancel();
		this.applyLocation(null);

		if (!userId) return;

		await this.locationRepo.delete(userId);
	}

	private hydrateFromCache(userId: string): void {
		const cached = userProfileCache.read(userId);
		if (!cached) return;

		this.patchProfile(this.resolveCachedProfile(cached));
	}

	private resolveCachedProfile(cached?: Partial<UserProfileCacheData> | null): Partial<UserProfile> {
		if (!cached) return {};

		return {
			...(cached.avatar_url !== undefined && { avatar_url: cached.avatar_url }),
			...(cached.widgets_sequence !== undefined && { widgets_sequence: cached.widgets_sequence }),
			...(cached.widgets_slots !== undefined && { widgets_slots: cached.widgets_slots }),
		};
	}

	private applyProfile(profile: UserProfile): void {
		this.profile = profile;
		this.profileReady = true;
	}

	private patchProfile(patch: Partial<UserProfile>): void {
		this.profile = { ...(this.profile ?? createDefaultProfile()), ...patch };
	}

	private applyLocation(location: City | null): void {
		this.currentLocation = location;
		this.locationReady = true;
	}

	private scheduleServerUpdate(
		debouncer: Debouncer,
		delay: number,
		userId: string,
		operation: () => Promise<void>
	): void {
		debouncer.schedule(() => {
			if (this.userStore.id !== userId) return;
			void operation().catch(handleError);
		}, delay);
	}

	private arraysEqual(a?: string[] | null, b?: string[] | null): boolean {
		return a === b || (!!a && !!b && a.length === b.length && a.every((value, index) => value === b[index]));
	}

	private cancelPendingUpdates(): void {
		this.avatarUpdate.cancel();
		this.themeUpdate.cancel();
		this.widgetSequenceUpdate.cancel();
		this.widgetSlotsUpdate.cancel();
		this.locationUpdate.cancel();
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: IUserProfileRepo,
		private readonly locationRepo: IUserLocationRepo
	) {
		super();

		makeObservable<
			this,
			| 'currentLocation'
			| 'profileReady'
			| 'locationReady'
			| 'applyProfile'
			| 'patchProfile'
			| 'applyLocation'
			| 'reset'
		>(this, {
			profile: observable,
			currentLocation: observable,
			locationReady: observable,

			profileReady: observable,
			isReady: computed,
			isLocationReady: computed,

			location: computed,
			locationName: computed,
			locationRegion: computed,

			avatar: computed,
			firstName: computed,
			lastName: computed,
			birthDate: computed,
			birthYear: computed,
			birthMonth: computed,
			birthDay: computed,
			gender: computed,
			phone: computed,
			email: computed,
			theme: computed,
			widgets: computed,
			slots: computed,
			passwordChangedAt: computed,

			applyProfile: action,
			patchProfile: action,
			applyLocation: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					if (!userId) {
						this.reset();
						return;
					}

					this.hydrateFromCache(userId);
					void this.load(userId);
				},
				{ fireImmediately: true }
			)
		);
	}

	override destroy(): void {
		this.cancelPendingUpdates();
		super.destroy();
	}

	protected reset(): void {
		this.cancelPendingUpdates();

		this.profile = null;
		this.profileReady = false;
		this.currentLocation = null;
		this.locationReady = false;
	}
}
