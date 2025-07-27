import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage';

export class UIStore {
	theme: 'light' | 'dark' = 'dark';

	get currentTheme() {
		return this.theme === 'light' ? 'Светлая' : 'Темная';
	}

	setTheme(theme: 'light' | 'dark') {
		if (this.theme === theme) return;

		this.theme = theme;
		storage.set('theme', theme);
		this.applyTheme(theme);
	}

	toggleTheme() {
		const newTheme = this.theme === 'dark' ? 'light' : 'dark';
		this.setTheme(newTheme);
	}

	private initTheme() {
		const savedTheme = storage.get('theme') as 'light' | 'dark' | null;

		if (savedTheme) this.theme = savedTheme;
		else {
			const prefersDark =
				typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

			this.theme = prefersDark ? 'dark' : 'light';
		}

		this.applyTheme(this.theme);
	}

	private applyTheme(theme: 'light' | 'dark') {
		document.body.classList.toggle('light-theme', theme === 'light');
		document.body.classList.toggle('dark-theme', theme === 'dark');
	}

	constructor() {
		makeAutoObservable(this);
		this.initTheme();
	}
}

export const uiStore = new UIStore();
