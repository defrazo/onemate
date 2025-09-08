import { makeAutoObservable, reaction } from 'mobx';

import type { IUserAccountPort } from '@/entities/user';
import type { IUserProfileAccountPort } from '@/entities/user-profile';
import type { IAuthAccountPort } from '@/features/user-auth';
import { validatePasswords } from '@/shared/lib/validators';
import type { Status } from '@/shared/stores';

export class AccountStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready';
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	async updateEmail(email: string): Promise<void> {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		await this.userStore.updateEmail(email);
	}

	async updateUsername(username: string): Promise<void> {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		await this.userStore.updateUsername(username);
	}

	async updatePassword(password: string, passConfirm?: string): Promise<void> {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		if (passConfirm) await validatePasswords(password, passConfirm);

		await this.userStore.updatePassword(password);
		await this.userProfileStore.markPasswordChanged(this.userStore.id);
	}

	async deleteAccount(): Promise<void> {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		await this.userProfileStore.deleteAccount(this.userStore.id);
		this.authStore.logout();
	}

	async restoreAccount() {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		await this.userProfileStore.restoreAccount(this.userStore.id);
	}

	private async hydrateAfterLogin(): Promise<void> {
		if (!this.userStore.id) throw new Error('Пользователь не авторизован');
		if (this.isLoading) return;

		this.setLoading();

		try {
			await this.userStore.loadUser();
			await this.userProfileStore.loadProfile();
			this.setReady();
		} catch (error) {
			this.setError(error);
		}
	}

	constructor(
		private readonly authStore: IAuthAccountPort,
		private readonly userStore: IUserAccountPort,
		private readonly userProfileStore: IUserProfileAccountPort
	) {
		makeAutoObservable<this, 'authStore' | 'userStore' | 'userProfileStore' | 'inited' | 'disposers'>(this, {
			authStore: false,
			userStore: false,
			userProfileStore: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => !id && this.reset(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.userStore.id, this.userProfileStore.isReady, this.authStore.isReady] as const,
				([id, isProfileReady, isAuthReady]) => {
					if (id && isProfileReady && isAuthReady) void this.hydrateAfterLogin();
				},
				{ fireImmediately: true }
			)
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

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
