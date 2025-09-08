import type { User } from '@supabase/supabase-js';
import { makeAutoObservable } from 'mobx';

import { cache } from '@/shared/lib/cache';
import { LS_CACHE_UI, storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';

import type { IBaseUserPort, IUserAccountPort, IUserAuthPort, IUserProfilePort, IUserRepo, Role, UserByEmail } from '.';
import { userService } from '.';

export class UserStore implements IBaseUserPort, IUserAccountPort, IUserAuthPort, IUserProfilePort {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private repo!: IUserRepo;

	user: User | null = null;
	id: string | null = null;
	lastId: string | null = null;
	passwords: [string, string] = ['', ''];

	get username(): string {
		return this.user?.user_metadata.username || 'Пользователь';
	}

	get email(): string {
		return this.user?.email ?? '';
	}

	get userRole(): Role {
		return this.user?.app_metadata.role === 'user' ? 'user' : 'demo';
	}

	setRepo(repo: IUserRepo) {
		this.repo = repo;
	}

	setPasswords(index: number, value: string): void {
		this.passwords[index] = value;
	}

	async getSession(): Promise<User> {
		const session = await userService.getSession();
		if (!session) throw new Error('Произошла ошибка при загрузке сессии');

		return session.user;
	}

	async updateUsername(username: string): Promise<void> {
		const user = await this.repo.updateUsername(username);
		this.setUser(user);
	}

	async updateEmail(email: string): Promise<void> {
		const user = await this.repo.updateEmail(email);
		this.setUser(user);
	}

	async updatePassword(password: string): Promise<void> {
		const user = await this.repo.updatePassword(password);
		this.setUser(user);
		this.clearPasswords();
	}

	async checkUserByEmail(email: string): Promise<UserByEmail | null> {
		const user = await userService.checkUserByEmail(email);
		return user;
	}

	async loadUser(): Promise<void> {
		const session = await userService.getSession();
		if (!session) {
			this.reset();
			return;
		}

		const user = await userService.getUser();
		if (!user) {
			this.reset();
			return;
		}

		this.setUser(user);
		cache.setUserId(user.id);

		try {
			const hydrated = await this.repo.loadUser();
			this.setUser(hydrated);
		} catch {}
	}

	private setUser(user: User | null): void {
		this.user = user;
		if (user) {
			this.id = user.id;
			this.lastId = user.id;
		} else this.id = null;

		this.updateDemoCache(this.userRole === 'demo' ? 'set' : 'remove');
	}

	private updateDemoCache(action: 'set' | 'remove'): void {
		const cached = (storage.get(LS_CACHE_UI) ?? {}) as Record<string, unknown>;

		if (action === 'set') {
			if (cached.demo === true) return;
			if (cached.demo === false) return;

			cached.demo = false;
			storage.set(LS_CACHE_UI, cached);
			return;
		}

		if ('demo' in cached) {
			delete cached.demo;
			Object.keys(cached).length === 0 ? storage.remove(LS_CACHE_UI) : storage.set(LS_CACHE_UI, cached);
		}
	}

	private clearPasswords(): void {
		this.passwords = ['', ''];
	}

	private clearUser(): void {
		if (this.id) cache.clear(this.id);
		this.user = null;
		this.id = null;
	}

	constructor() {
		makeAutoObservable<this, 'repo' | 'inited' | 'disposers'>(this, {
			repo: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		void this.loadUser();

		this.track(
			userService.onAuthStateChange((user) => {
				if (user) {
					this.setUser(user);
					cache.setUserId(user.id);
				} else this.reset();
			})
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
	}

	reset(): void {
		this.clearUser();
		this.clearPasswords();
		this.updateDemoCache('remove');

		if (this.lastId) storage.remove(key(this.lastId, 'user'));
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
