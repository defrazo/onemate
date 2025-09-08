import { makeAutoObservable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import type { IUserProfileThemePort } from '@/entities/user-profile';
import { DEFAULT_THEME } from '@/shared/lib/constants';
import { LS_CACHE_UI, storage } from '@/shared/lib/storage';

import type { Theme } from '.';

export class ThemeStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;

	theme: Theme = DEFAULT_THEME;

	get currentTheme(): 'Светлая' | 'Темная' {
		return this.theme === 'light' ? 'Светлая' : 'Темная';
	}

	setTheme(theme: Theme): void {
		if (this.theme === theme) return;

		this.theme = theme;
		this.saveTheme(theme);

		if (this.userStore.id) this.userProfileStore.updateTheme(theme);
	}

	toggleTheme(): void {
		this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
	}

	private applyRemoteTheme(theme: Theme): void {
		if (this.theme === theme) return;

		this.theme = theme;
		this.saveTheme(theme);
	}

	private setLocalTheme(theme: Theme): void {
		if (this.theme !== theme) this.theme = theme;
		this.applyTheme(theme);
	}

	private applyTheme(theme: Theme): void {
		if (typeof document === 'undefined') return;

		document.documentElement.classList.remove('light-theme', 'dark-theme');
		document.documentElement.classList.add(`${theme}-theme`);
		document.documentElement.style.colorScheme = theme;
	}

	private saveTheme(theme: Theme): void {
		this.applyTheme(theme);

		const cached = storage.get(LS_CACHE_UI) ?? {};
		storage.set(LS_CACHE_UI, { ...cached, theme });
	}

	private onStorage = (event: StorageEvent): void => {
		if (event.key !== LS_CACHE_UI || !event.newValue) return;

		try {
			const theme = storage.get(LS_CACHE_UI).theme;
			if (theme === 'light' || theme === 'dark') this.setLocalTheme(theme);
		} catch {}
	};

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly userProfileStore: IUserProfileThemePort
	) {
		makeAutoObservable<this, 'userStore' | 'userProfileStore' | 'inited' | 'disposers'>(this, {
			userStore: false,
			userProfileStore: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		const stored = storage.get(LS_CACHE_UI)?.theme;
		const initial: Theme = stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
		this.setLocalTheme(initial);

		this.track(
			reaction(
				() => [this.userStore.id, this.userProfileStore.isReady, this.userProfileStore.theme] as const,
				([id, isReady, remote]) => {
					if (!isReady) return;
					if (id) {
						if (remote === 'light' || remote === 'dark') this.applyRemoteTheme(remote);
					} else this.reset();
				},
				{ fireImmediately: true }
			)
		);

		if (typeof window !== 'undefined') window.addEventListener('storage', this.onStorage);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
		if (typeof window !== 'undefined') window.removeEventListener('storage', this.onStorage);
	}

	private reset(): void {
		this.setTheme(DEFAULT_THEME);
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
