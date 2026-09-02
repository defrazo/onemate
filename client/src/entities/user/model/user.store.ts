import { action, computed, makeObservable, observable } from 'mobx';

import { clearCache } from '@/shared/lib/cache';
import { BaseStore } from '@/shared/lib/store';

import { userCache } from '../lib';
import type { IBaseUserPort, IUserAuthPort, IUserProfilePort, IUserRepo, IUserRoutingPort, Role, User } from '.';

export class UserStore extends BaseStore implements IBaseUserPort, IUserAuthPort, IUserProfilePort, IUserRoutingPort {
	private repo: IUserRepo | null = null;

	user: User | null = null;
	lastId: string | null = null;

	get id(): string | null {
		return this.user?.id ?? null;
	}

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

	private get userRepo(): IUserRepo {
		if (!this.repo) throw new Error('User repository is not initialized');
		return this.repo;
	}

	setRepo(repo: IUserRepo): void {
		if (this.repo) throw new Error('User repository already initialized');
		this.repo = repo;
	}

	setUser(user: User | null): void {
		this.user = user;
		if (!user) return;

		this.lastId = user.id;

		userCache.setUserId(user.id);
		userCache.setDeletedAt(user.id, user.deleted_at);
	}

	clearSession(): void {
		const userId = this.id ?? this.lastId;

		this.user = null;

		if (userId) clearCache(userId);
	}

	async loadUser(): Promise<void> {
		this.setUser(await this.userRepo.loadUser());
	}

	async deleteAccount(): Promise<void> {
		this.setUser(await this.userRepo.deleteAccount());
	}

	async restoreAccount(): Promise<void> {
		this.setUser(await this.userRepo.restoreAccount());
	}

	async updateUsername(username: string): Promise<void> {
		this.setUser(await this.userRepo.updateUsername(username));
	}

	async updateEmail(email: string, currentPassword: string): Promise<void> {
		this.setUser(await this.userRepo.updateEmail(email, currentPassword));
	}

	async updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void> {
		this.setUser(await this.userRepo.updatePassword(currentPassword, password, passwordConfirmation));
	}

	async resendPendingEmail(): Promise<void> {
		await this.userRepo.resendPendingEmail();
	}

	async cancelPendingEmail(): Promise<void> {
		this.setUser(await this.userRepo.cancelPendingEmail());
	}

	async verifyPendingEmail(id: string, hash: string, params: Record<string, string>): Promise<User> {
		return this.userRepo.verifyPendingEmail(id, hash, params);
	}

	constructor() {
		super();

		makeObservable<this, 'reset'>(this, {
			user: observable,

			id: computed,
			username: computed,
			email: computed,
			pendingEmail: computed,
			isEmailPending: computed,
			userRole: computed,
			isDeleted: computed,
			deletedAt: computed,

			setUser: action,
			clearSession: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	protected reset(): void {
		const userId = this.id ?? this.lastId;
		this.user = null;

		if (userId) clearCache(userId);
	}
}
