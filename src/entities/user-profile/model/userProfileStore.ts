import { makeAutoObservable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import type { Theme } from '@/features/theme-switcher';
import type { Cache } from '@/shared/lib/cache';
import { cache, clearCache, readCache } from '@/shared/lib/cache';
import { createDefaultProfile, createDefaultWidgets, DEFAULT_AVATAR, DEFAULT_THEME } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';
import type { Status } from '@/shared/stores';

import type {
	Gender,
	IUserProfileAccountPort,
	IUserProfileProfilePort,
	IUserProfileRepo,
	IUserProfileThemePort,
	UserProfile,
} from '.';

export class UserProfileStore implements IUserProfileAccountPort, IUserProfileProfilePort, IUserProfileThemePort {
	private debounce: Record<'avatar' | 'theme' | 'widgets', ReturnType<typeof setTimeout> | null> = {
		avatar: null,
		theme: null,
		widgets: null,
	};
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	profile: UserProfile | null = null;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.profile !== null;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	get avatar(): string {
		return this.profile?.avatar_url ?? DEFAULT_AVATAR;
	}

	get firstName(): string {
		return this.profile?.first_name ?? '';
	}

	get lastName(): string {
		return this.profile?.last_name ?? '';
	}

	get birthYear(): string {
		return this.profile?.birth_year ?? '';
	}

	get birthMonth(): string {
		return this.profile?.birth_month ?? '';
	}

	get birthDay(): string {
		return this.profile?.birth_day ?? '';
	}

	get gender(): Gender {
		return this.profile?.gender ?? '';
	}

	get phone(): string[] {
		return this.profile?.phone || [''];
	}

	get email(): string[] {
		return this.profile?.email || [''];
	}

	get theme(): Theme {
		return this.profile?.theme ?? DEFAULT_THEME;
	}

	get widgets(): string[] {
		return this.profile?.widgets_sequence || createDefaultWidgets();
	}

	get isDeleted(): boolean {
		return !!this.profile?.deleted_at;
	}

	get deletedAt(): string | null {
		return this.profile?.deleted_at ?? null;
	}

	get passwordChangedAt(): string | null {
		return this.profile?.password_changed_at ?? null;
	}

	async loadProfile(): Promise<void> {
		if (!this.userStore.id) return;

		const cachedUi = readCache(this.userStore.id)?.ui;
		if (cachedUi) this.applyCache(cachedUi);

		if (!this.profile && !cachedUi && !this.isLoading) this.setLoading();

		try {
			const server = await this.repo.loadProfile(this.userStore.id);

			runInAction(() => {
				let merged: UserProfile = { ...createDefaultProfile(), ...server };

				if (cachedUi) {
					if (cachedUi!.avatar_url) merged.avatar_url = cachedUi!.avatar_url;
					if (cachedUi!.widgets_sequence?.length) merged.widgets_sequence = cachedUi!.widgets_sequence;
				}

				this.profile = merged;
			});

			this.setReady();
			this.cacheSync();
		} catch (error) {
			this.setError(error);
		}
	}

	async updateProfile(profile: UserProfile): Promise<void> {
		if (!this.userStore.id) return;

		try {
			await this.repo.updateProfile(this.userStore.id, profile);
		} catch (error) {
			this.setError(error);
		}
	}

	async updateAvatar(avatar: string): Promise<void> {
		if (this.profile?.avatar_url === avatar || !this.userStore.id) return;

		runInAction(() => this.profile && (this.profile.avatar_url = avatar));
		cache.setAvatar(this.userStore.id, avatar);

		if (this.debounce.avatar) clearTimeout(this.debounce.avatar);

		const id = this.userStore.id;
		this.debounce.avatar = setTimeout(async () => {
			try {
				if (!id || this.userStore.id !== id) return;
				await this.repo.updateAvatar(id, avatar);
			} catch (error) {
				this.setError(error);
			}
		}, 500);
	}

	async updateTheme(theme: Theme): Promise<void> {
		if (this.profile?.theme === theme || !this.userStore.id) return;

		runInAction(() => this.profile && (this.profile.theme = theme));

		if (this.debounce.theme) clearTimeout(this.debounce.theme);

		const id = this.userStore.id;
		this.debounce.theme = setTimeout(async () => {
			try {
				if (!id || this.userStore.id !== id) return;
				await this.repo.updateTheme(id, theme);
			} catch (error) {
				this.setError(error);
			}
		}, 500);
	}

	async updateWidgetSequence(widgets: string[]): Promise<void> {
		if (!this.userStore.id) return;

		if (this.arraysEqual(this.profile?.widgets_sequence, widgets)) return;

		runInAction(() => this.profile && (this.profile.widgets_sequence = widgets));
		cache.setWidgets(this.userStore.id, widgets);

		if (this.debounce.widgets) clearTimeout(this.debounce.widgets);

		const id = this.userStore.id;
		this.debounce.widgets = setTimeout(async () => {
			try {
				if (!id || this.userStore.id !== id) return;
				await this.repo.updateWidgets(id, widgets);
			} catch (error) {
				this.setError(error);
			}
		}, 2000);
	}

	async markPasswordChanged(id: string): Promise<void> {
		try {
			const iso = await this.repo.markPasswordChanged(id);
			runInAction(() => this.profile && (this.profile = { ...this.profile, password_changed_at: iso }));
		} catch (error) {
			this.setError(error);
		}
	}

	async deleteAccount(id: string): Promise<void> {
		try {
			const iso = await this.repo.deleteAccount(id);
			runInAction(() => this.profile && (this.profile = { ...this.profile, deleted_at: iso }));
		} catch (error) {
			this.setError(error);
		}
	}

	async restoreAccount(id: string): Promise<void> {
		try {
			await this.repo.restoreAccount(id);
			runInAction(() => this.profile && (this.profile = { ...this.profile, deleted_at: null }));
		} catch (error) {
			this.setError(error);
		}
	}

	private hydrateFromCacheSync(): void {
		if (!this.userStore.id) return;

		const cachedUi = readCache(this.userStore.id)?.ui;
		if (!cachedUi) return;

		this.applyCache(cachedUi);
		this.setReady();
	}

	private applyCache(ui: NonNullable<Cache['ui']>): void {
		if (!this.profile) this.profile = createDefaultProfile();
		if (ui.avatar_url) this.profile.avatar_url = ui.avatar_url;
		if (ui.widgets_sequence?.length) this.profile.widgets_sequence = ui.widgets_sequence;
	}

	private cacheSync(): void {
		if (!this.profile || !this.isReady || !this.userStore.id) return;

		if (this.profile.avatar_url) cache.setAvatar(this.userStore.id, this.profile.avatar_url);
		if (this.profile.widgets_sequence) cache.setWidgets(this.userStore.id, this.profile.widgets_sequence);
	}

	private arraysEqual(a?: string[], b?: string[]): boolean {
		return a === b || (!!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]));
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: IUserProfileRepo
	) {
		makeAutoObservable<this, 'userStore' | 'repo' | 'inited' | 'disposers' | 'debounce'>(this, {
			userStore: false,
			repo: false,
			inited: false,
			disposers: false,
			debounce: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		if (this.userStore.id) this.hydrateFromCacheSync();

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => (id ? this.loadProfile() : this.reset()),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => this.profile?.deleted_at ?? null,
				(deletedAt) => {
					if (!this.userStore.id) return;
					cache.setAccountDeleted(this.userStore.id, deletedAt);
				},
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		Object.values(this.debounce).forEach((timer) => timer && clearTimeout(timer));
		this.debounce = { avatar: null, theme: null, widgets: null };
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
	}

	restart(): void {
		this.destroy();
		this.init();
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = this.profile ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		Object.values(this.debounce).forEach((t) => t && clearTimeout(t));
		this.debounce = { avatar: null, theme: null, widgets: null };

		this.status = 'idle';
		this.error = null;
		this.profile = null;

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'profile'));
		if (this.userStore.lastId) clearCache(this.userStore.lastId);
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
