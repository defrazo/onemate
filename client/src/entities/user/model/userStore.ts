import { makeAutoObservable } from 'mobx';

import { cache } from '@/shared/lib/cache';
import { LS_CACHE_UI, storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';

import type { IBaseUserPort, IUserAccountPort, IUserAuthPort, IUserProfilePort, IUserRepo, Role, User } from '.';

export class UserStore implements IBaseUserPort, IUserAccountPort, IUserAuthPort, IUserProfilePort {
	private inited = false;
	private repo!: IUserRepo;

	user: User | null = null;
	id: string | null = null;
	lastId: string | null = null;
	passwords: [string, string, string] = ['', '', ''];

	get username(): string {
		return this.user?.username ?? 'Пользователь';
	}

	get email(): string {
		return this.user?.email ?? '';
	}

	get pendingEmail(): string {
		return this.user?.pending_email ?? '';
	}

	get isEmailPending(): boolean {
		return !!this.user?.pending_email;
	}

	get userRole(): Role {
		return this.user?.role ?? 'user';
	}

	get isDeleted(): boolean {
		return !!this.user?.deleted_at;
	}

	get deletedAt(): string | null {
		return this.user?.deleted_at ?? null;
	}

	setUser(user: User | null): void {
		this.user = user;

		if (user) {
			this.id = user.id;
			this.lastId = user.id;
			cache.setUserId(user.id);
		} else {
			this.id = null;
		}

		this.updateDemoCache(this.userRole === 'demo' ? 'set' : 'remove');
	}

	setRepo(repo: IUserRepo): void {
		this.repo = repo;
	}

	setPasswords(index: number, value: string): void {
		this.passwords[index] = value;
	}

	clearPasswords(): void {
		this.passwords = ['', '', ''];
	}

	async loadUser(): Promise<void> {
		const user = await this.repo.loadUser();
		this.setUser(user);
	}

	async deleteAccount(): Promise<void> {
		const user = await this.repo.deleteAccount();
		this.setUser(user);
	}

	async restoreAccount(): Promise<void> {
		const user = await this.repo.restoreAccount();
		this.setUser(user);
	}

	async updateUsername(username: string): Promise<void> {
		const user = await this.repo.updateUsername(username);
		this.setUser(user);
	}

	async updateEmail(email: string, currentPassword: string): Promise<void> {
		const user = await this.repo.updateEmail(email, currentPassword);
		this.setUser(user);
	}

	async updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void> {
		const user = await this.repo.updatePassword(currentPassword, password, passwordConfirmation);
		this.setUser(user);
		this.clearPasswords();
	}

	async resendPendingEmail(): Promise<void> {
		await this.repo.resendPendingEmail();
	}

	async cancelPendingEmail(): Promise<void> {
		const user = await this.repo.cancelPendingEmail();
		this.setUser(user);
	}

	async verifyPendingEmail(id: string, hash: string, params: Record<string, string>): Promise<User> {
		return this.repo.verifyPendingEmail(id, hash, params);
	}

	private clearUser(): void {
		if (this.id) cache.clear(this.id);
		this.user = null;
		this.id = null;
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

	constructor() {
		makeAutoObservable<this, 'repo' | 'inited'>(this, {
			repo: false,
			inited: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.inited = false;
	}

	reset(): void {
		this.clearUser();
		this.clearPasswords();
		this.updateDemoCache('remove');

		if (this.lastId) storage.remove(key(this.lastId, 'user'));
	}
}
