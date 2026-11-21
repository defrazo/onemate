import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { type City, isSameCity } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { IUserLocationRepo } from '@/entities/user-location';
import { AVATAR_ENTRIES, type AvatarId, AVATARS } from '@/shared/assets/images/avatars';
import { DEFAULT_THEME, type Theme, WIDGETS } from '@/shared/config';
import { handleError } from '@/shared/lib/errors';
import { AsyncStore, Debouncer } from '@/shared/lib/store';

import { type PendingProfileData, userProfileCache, type UserProfileCacheData } from '../lib/userProfileCache';
import { createDefaultDashboardLayout, createDefaultProfile, createDefaultSlots } from './defaults';
import type { IUserProfileRepo, IUserProfileThemePort } from './ports';
import type { Gender, UserProfile, UserProfilePatch } from './types';
import {
	type DashboardLayout,
	normalizeDashboardLayout,
	normalizeMobileWidgets,
	normalizeWidgetSlots,
	type WidgetId,
	type WidgetSlot,
} from './widgets';

export class UserProfileStore extends AsyncStore implements IUserProfileThemePort {
	private readonly avatarUpdate = new Debouncer();
	private readonly themeUpdate = new Debouncer();
	private readonly widgetSequenceUpdate = new Debouncer();
	private readonly widgetSlotsUpdate = new Debouncer();
	private readonly locationUpdate = new Debouncer();
	private readonly changedFields = new Map<keyof UserProfile, number>();

	private mobileWidgetsSave: Promise<void> = Promise.resolve();

	private generation = 0;
	private profileVersion = 0;
	private locationVersion = 0;
	private pendingProfile: PendingProfileData = {};
	private initializing: Promise<void> | null = null;

	profile: UserProfile | null = null;
	loadError: Error | null = null;

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

	get phones(): string[] {
		return this.profile?.phones ?? [''];
	}

	get emails(): string[] {
		return this.profile?.additional_emails ?? [''];
	}

	get theme(): Theme {
		return this.profile?.theme ?? DEFAULT_THEME;
	}

	get widgets(): DashboardLayout {
		return this.profile?.widgets_sequence ?? createDefaultDashboardLayout();
	}

	get mobileWidgets(): WidgetId[] {
		return normalizeMobileWidgets(this.profile?.mobile_widgets) ?? WIDGETS.map(({ id }) => id);
	}

	get slots(): WidgetSlot[] {
		return this.profile?.widgets_slots ?? createDefaultSlots();
	}

	get passwordChangedAt(): string | null {
		return this.profile?.password_changed_at ?? null;
	}

	markPasswordChanged(): void {
		this.patchProfile({ password_changed_at: new Date().toISOString() });
	}

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!this.inited || !userId || (this.isReady && this.isLocationReady)) return Promise.resolve();
		if (this.initializing) return this.initializing;

		const generation = this.generation;
		runInAction(() => (this.loadError = null));

		const promise = this.load(userId).catch((error) => {
			if (this.current(userId, generation))
				runInAction(() => (this.loadError = error instanceof Error ? error : new Error(String(error))));
			throw error;
		});
		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	private async load(userId: string): Promise<void> {
		const generation = this.generation;

		await this.withLoading(async () => {
			const results = await Promise.allSettled([
				this.isReady ? Promise.resolve() : this.loadProfile(userId),
				this.isLocationReady ? Promise.resolve() : this.loadLocation(userId),
			]);

			for (const result of results) {
				if (this.current(userId, generation) && result.status === 'rejected') handleError(result.reason);
			}
		});
	}

	private async loadProfile(userId: string): Promise<void> {
		const generation = this.generation;
		const version = this.profileVersion;
		const pending = { ...this.pendingProfile };
		const server = await this.repo.loadProfile(userId);

		if (!this.current(userId, generation)) return;

		const profile: UserProfile = {
			...createDefaultProfile(),
			...server,
			...pending,
			...this.pendingProfile,
			...this.changesSince(version),
		};

		this.applyProfile(profile);
		userProfileCache.sync(userId, server);
	}

	private async loadLocation(userId: string): Promise<void> {
		const generation = this.generation;
		const version = this.locationVersion;
		const location = await this.locationRepo.load(userId);

		if (!this.current(userId, generation) || version !== this.locationVersion) return;

		this.applyLocation(location);
	}

	async updateProfile(patch: UserProfilePatch): Promise<void> {
		const normalized: UserProfilePatch = {
			...patch,
			...(patch.phones !== undefined && {
				phones: patch.phones?.map((phone) => phone.trim()).filter(Boolean) ?? null,
			}),
			...(patch.additional_emails !== undefined && {
				additional_emails: patch.additional_emails?.map((email) => email.trim()).filter(Boolean) ?? null,
			}),
		};

		await this.saveProfile(normalized, (id, data) => this.repo.updateProfile(id, data));
	}

	async updateAvatar(avatar: string): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.profile?.avatar_url === avatar) return;

		this.patchProfile({ avatar_url: avatar });
		this.pendingProfile.avatar_url = avatar;
		userProfileCache.setAvatar(userId, avatar);

		this.scheduleServerUpdate(this.avatarUpdate, 500, userId, () => this.repo.updateAvatar(userId, avatar), {
			avatar_url: avatar,
		});
	}

	async updateTheme(theme: Theme): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.profile?.theme === theme) return;

		this.patchProfile({ theme });
		this.pendingProfile.theme = theme;
		userProfileCache.setTheme(userId, theme);

		this.scheduleServerUpdate(this.themeUpdate, 500, userId, () => this.repo.updateTheme(userId, theme), { theme });
	}

	async updateNotification(patch: UserProfilePatch): Promise<void> {
		await this.saveProfile(patch, (id, data) => this.repo.updateNotification(id, data));
	}

	async setSlotWidgets(index: number, primary: WidgetId, secondary: WidgetId | ''): Promise<void> {
		const widgets = normalizeDashboardLayout(this.widgets);
		const slot = widgets[index];

		if (!slot || (secondary && secondary === primary)) return;

		const previousPrimary = slot[0];

		if (previousPrimary !== primary) {
			for (const other of widgets) {
				if (other[0] === primary) other[0] = previousPrimary;
				else if (other[1] === primary) other[1] = previousPrimary;
			}

			slot[0] = primary;
		}

		for (const other of widgets) {
			if (other !== slot && other[1] === secondary) other.splice(1, 1);
		}

		if (secondary) {
			if (widgets.some((other) => other !== slot && other[0] === secondary)) return;
			slot[1] = secondary;
		} else slot.splice(1, 1);

		await this.updateWidgetSequence(widgets, true);
	}

	async updateWidgetSequence(value: DashboardLayout, immediate = false): Promise<void> {
		const userId = this.userStore.id;
		const widgets = normalizeDashboardLayout(value);
		if (!userId) return;

		const unchanged = JSON.stringify(this.widgets) === JSON.stringify(widgets);
		if (unchanged && !immediate) return;

		if (!unchanged) {
			this.patchProfile({ widgets_sequence: widgets });
			this.pendingProfile.widgets_sequence = widgets;

			userProfileCache.setWidgets(userId, widgets);
		}

		if (immediate) {
			this.widgetSequenceUpdate.cancel();
			const generation = this.generation;

			await this.repo.updateWidgets(userId, widgets);

			if (this.current(userId, generation)) this.confirmPending(userId, { widgets_sequence: widgets });

			return;
		}

		this.scheduleServerUpdate(
			this.widgetSequenceUpdate,
			3000,
			userId,
			() => this.repo.updateWidgets(userId, widgets),
			{ widgets_sequence: widgets }
		);
	}

	async updateMobileWidgets(value: WidgetId[]): Promise<void> {
		const userId = this.userStore.id;
		const widgets = normalizeMobileWidgets(value);
		if (!userId || !this.isReady || !widgets) return;

		const generation = this.generation;

		this.patchProfile({ mobile_widgets: widgets });
		this.pendingProfile.mobile_widgets = widgets;

		userProfileCache.setMobileWidgets(userId, widgets);

		const save = this.mobileWidgetsSave.then(async () => {
			if (!this.current(userId, generation)) return;

			await this.repo.updateMobileWidgets(userId, widgets);

			if (this.current(userId, generation)) this.confirmPending(userId, { mobile_widgets: widgets });
		});

		this.mobileWidgetsSave = save.catch(() => {});

		try {
			await save;
		} catch (error) {
			if (this.current(userId, generation)) throw error;
		}
	}

	async updateWidgetSlots(slots: WidgetSlot[]): Promise<void> {
		slots = normalizeWidgetSlots(slots) ?? createDefaultSlots();

		const userId = this.userStore.id;
		if (!userId || this.arraysEqual(this.profile?.widgets_slots, slots)) return;

		this.patchProfile({ widgets_slots: slots });
		this.pendingProfile.widgets_slots = slots;
		userProfileCache.setSlots(userId, slots);

		this.scheduleServerUpdate(this.widgetSlotsUpdate, 2000, userId, () => this.repo.updateSlots(userId, slots), {
			widgets_slots: slots,
		});
	}

	setLocation(city: City): void {
		if (this.currentLocation && isSameCity(this.currentLocation, city)) return;

		const userId = this.userStore.id;
		this.locationVersion++;
		this.applyLocation(city);
		if (!userId) return;

		this.scheduleServerUpdate(this.locationUpdate, 500, userId, () => this.locationRepo.save(userId, city));
	}

	async deleteLocation(): Promise<void> {
		const userId = this.userStore.id;
		this.locationVersion++;

		this.locationUpdate.cancel();
		this.applyLocation(null);

		if (!userId) return;

		await this.locationRepo.delete(userId);
	}

	private hydrateFromCache(userId: string): void {
		const cached = userProfileCache.read(userId);
		this.pendingProfile = userProfileCache.readPending(userId);
		this.patchProfile({ ...this.resolveCachedProfile(cached), ...this.pendingProfile });
	}

	private resolveCachedProfile(cached?: Partial<UserProfileCacheData> | null): Partial<UserProfile> {
		if (!cached) return {};

		return {
			...(cached.avatar_url !== undefined && { avatar_url: cached.avatar_url }),
			...(cached.mobile_widgets !== undefined && { mobile_widgets: cached.mobile_widgets }),
			...(cached.widgets_sequence !== undefined && { widgets_sequence: cached.widgets_sequence }),
			...(cached.widgets_slots !== undefined && { widgets_slots: cached.widgets_slots }),
		};
	}

	private applyProfile(profile: UserProfile): void {
		this.profile = {
			...profile,
			mobile_widgets: normalizeMobileWidgets(profile.mobile_widgets),
			widgets_sequence: normalizeDashboardLayout(profile.widgets_sequence),
			widgets_slots: normalizeWidgetSlots(profile.widgets_slots),
		};
		this.profileReady = true;
	}

	private patchProfile(patch: Partial<UserProfile>): void {
		const version = ++this.profileVersion;
		for (const field of Object.keys(patch) as (keyof UserProfile)[]) this.changedFields.set(field, version);

		this.profile = {
			...(this.profile ?? createDefaultProfile()),
			...patch,
			...(patch.widgets_sequence !== undefined && {
				widgets_sequence: normalizeDashboardLayout(patch.widgets_sequence),
			}),
			...(patch.widgets_slots !== undefined && { widgets_slots: normalizeWidgetSlots(patch.widgets_slots) }),
		};
	}

	private applyLocation(location: City | null): void {
		this.currentLocation = location;
		this.locationReady = true;
	}

	private scheduleServerUpdate(
		debouncer: Debouncer,
		delay: number,
		userId: string,
		operation: () => Promise<void>,
		saved?: PendingProfileData
	): void {
		const generation = this.generation;

		debouncer.schedule(() => {
			if (!this.current(userId, generation)) return;

			void operation()
				.then(() => {
					if (saved && this.current(userId, generation)) this.confirmPending(userId, saved);
				})
				.catch((error) => {
					if (this.current(userId, generation)) handleError(error);
				});
		}, delay);
	}

	private confirmPending(userId: string, saved: PendingProfileData): void {
		for (const field of Object.keys(saved) as (keyof PendingProfileData)[]) {
			if (JSON.stringify(this.pendingProfile[field]) === JSON.stringify(saved[field]))
				delete this.pendingProfile[field];
		}
		userProfileCache.confirm(userId, saved);
	}

	private arraysEqual(a?: string[] | null, b?: string[] | null): boolean {
		return a === b || (!!a && !!b && a.length === b.length && a.every((value, idx) => value === b[idx]));
	}

	private cancelPendingUpdates(): void {
		this.avatarUpdate.cancel();
		this.themeUpdate.cancel();
		this.widgetSequenceUpdate.cancel();
		this.widgetSlotsUpdate.cancel();
		this.locationUpdate.cancel();
	}

	private async saveProfile(
		patch: UserProfilePatch,
		save: (userId: string, patch: UserProfilePatch) => Promise<UserProfile>
	): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		const generation = this.generation;
		const version = this.profileVersion;

		await this.withLoading(async () => {
			const pending = { ...this.pendingProfile };

			let updated: UserProfile;

			try {
				updated = await save(userId, patch);
			} catch (error) {
				if (this.current(userId, generation)) throw error;
				return;
			}
			if (!this.current(userId, generation)) return;
			const nextProfile = {
				...createDefaultProfile(),
				...updated,
				...pending,
				...this.pendingProfile,
				...this.changesSince(version),
			};

			this.applyProfile(nextProfile);
			userProfileCache.sync(userId, updated);
		});
	}

	private current(userId: string, generation: number): boolean {
		return this.inited && this.userStore.id === userId && this.generation === generation;
	}

	private changesSince(version: number): Partial<UserProfile> {
		return Object.fromEntries(
			[...this.changedFields]
				.filter(([, changed]) => changed > version)
				.map(([field]) => [field, this.profile?.[field]])
		);
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
			| 'markPasswordChanged'
			| 'reset'
		>(this, {
			profile: observable,
			loadError: observable,
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
			phones: computed,
			emails: computed,
			theme: computed,
			widgets: computed,
			slots: computed,
			mobileWidgets: computed,
			passwordChangedAt: computed,

			applyProfile: action,
			patchProfile: action,
			applyLocation: action,
			markPasswordChanged: action,
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
					this.reset();
					if (!userId) return;

					this.hydrateFromCache(userId);
					void this.ensureLoaded().catch(() => {});
				},
				{ fireImmediately: true }
			)
		);
	}

	override destroy(): void {
		this.reset();
		super.destroy();
	}

	protected reset(): void {
		this.generation++;
		this.initializing = null;
		this.loadError = null;
		this.pendingProfile = {};
		this.changedFields.clear();
		this.profileVersion = 0;
		this.locationVersion = 0;
		this.cancelPendingUpdates();

		this.profile = null;
		this.profileReady = false;
		this.currentLocation = null;
		this.locationReady = false;
	}
}
