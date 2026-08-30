import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import type { IUserProfileThemePort } from '@/entities/user-profile';
import { DEFAULT_THEME, LS_CACHE_UI, type Theme } from '@/shared/config';
import { storage } from '@/shared/lib/storage';
import { BaseStore } from '@/shared/lib/store';

export class ThemeStore extends BaseStore {
	theme: Theme = DEFAULT_THEME;

	get currentTheme(): 'Светлая' | 'Темная' {
		return this.theme === 'light' ? 'Светлая' : 'Темная';
	}

	setTheme(theme: Theme): void {
		if (this.theme === theme) return;

		this.setLocalTheme(theme);

		if (this.userStore.id) void this.userProfileStore.updateTheme(theme);
	}

	toggleTheme(): void {
		this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
	}

	private setLocalTheme(theme: Theme): void {
		this.theme = theme;
		this.applyTheme(theme);
		this.saveTheme(theme);
	}

	private applyTheme(theme: Theme): void {
		if (typeof document === 'undefined') return;

		document.documentElement.classList.remove('light-theme', 'dark-theme');
		document.documentElement.classList.add(`${theme}-theme`);
		document.documentElement.style.colorScheme = theme;
	}

	private saveTheme(theme: Theme): void {
		const cached = storage.get(LS_CACHE_UI) ?? {};
		storage.set(LS_CACHE_UI, { ...cached, theme });
	}

	private getStoredTheme(): Theme {
		const stored = storage.get(LS_CACHE_UI)?.theme;

		return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
	}

	private onStorage = (event: StorageEvent): void => {
		if (event.key !== LS_CACHE_UI || !event.newValue) return;

		const theme = this.getStoredTheme();
		this.setLocalTheme(theme);
	};

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly userProfileStore: IUserProfileThemePort
	) {
		super();

		makeObservable<this, 'applyTheme' | 'setLocalTheme' | 'reset'>(this, {
			theme: observable,
			currentTheme: computed,

			setTheme: action,
			toggleTheme: action,

			setLocalTheme: action,
			reset: action,

			applyTheme: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.setLocalTheme(this.getStoredTheme());

		this.track(
			reaction(
				() => [this.userStore.id, this.userProfileStore.isReady, this.userProfileStore.theme] as const,
				([id, isReady, remoteTheme]) => {
					if (!id || !isReady) return;
					if (remoteTheme === 'light' || remoteTheme === 'dark') this.setLocalTheme(remoteTheme);
				},
				{ fireImmediately: true }
			)
		);

		if (typeof window !== 'undefined') window.addEventListener('storage', this.onStorage);
	}

	override destroy(): void {
		if (typeof window !== 'undefined') window.removeEventListener('storage', this.onStorage);
		super.destroy();
	}

	protected reset(): void {
		this.setLocalTheme(DEFAULT_THEME);
	}
}
