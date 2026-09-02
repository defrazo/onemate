import { action, computed, makeObservable, observable } from 'mobx';

import type { IUserAuthPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { authApi } from '../api';
import type { IAuthDevicePort } from '.';

export class AuthStore extends AsyncStore implements IAuthDevicePort {
	isInitializing = true;
	lastAuthTime = 0;

	get isReady(): boolean {
		return !!this.userStore.id;
	}

	async verifyInvite(inviteCode: string): Promise<string> {
		if (this.isLoading) throw new Error('Операция уже выполняется');

		return this.withLoading(async () => {
			const { invite_token } = await authApi.verifyInvite(inviteCode.trim());
			return invite_token;
		});
	}

	async verifyEmail(id: string, hash: string, params: Record<string, string>): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			const { user } = await authApi.verifyEmail(id, hash, params);

			this.userStore.setUser(user);
			this.updateAuthTime();

			return true;
		});
	}

	async login(login: string, password: string): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			const { user } = await authApi.login({ login: login.trim(), password });

			this.userStore.setUser(user);
			this.updateAuthTime();

			return true;
		});
	}

	async register(
		username: string,
		email: string,
		password: string,
		passwordConfirm: string,
		inviteToken: string,
		privacyAccepted: boolean
	): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			await authApi.register({
				username: username.trim(),
				email: email.trim().toLowerCase(),
				password,
				password_confirmation: passwordConfirm,
				invite_token: inviteToken,
				privacy_accepted: privacyAccepted,
			});

			return true;
		});
	}

	async resendConfirmation(email: string): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			await authApi.resendVerification(email.trim().toLowerCase());
			return true;
		});
	}

	async forgotPassword(email: string): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			await authApi.forgotPassword({ email: email.trim().toLowerCase() });
			return true;
		});
	}

	async resetPassword(email: string, token: string, password: string, passwordConfirm: string): Promise<boolean> {
		if (this.isLoading) return false;

		return this.withLoading(async () => {
			await authApi.resetPassword({
				email: email.trim().toLowerCase(),
				token,
				password,
				password_confirmation: passwordConfirm,
			});

			return true;
		});
	}

	async logout(): Promise<void> {
		try {
			await authApi.logout();
		} finally {
			this.userStore.clearSession();
			this.reset();
		}
	}

	private async checkAuth(): Promise<void> {
		const { authenticated, user } = await authApi.getSession();

		if (!authenticated || !user) {
			this.userStore.setUser(null);
			return;
		}

		this.userStore.setUser(user);
	}

	private updateAuthTime(): void {
		this.lastAuthTime = Date.now();
	}

	constructor(private readonly userStore: IUserAuthPort) {
		super();

		makeObservable<this, 'updateAuthTime' | 'reset'>(this, {
			isInitializing: observable,
			lastAuthTime: observable,
			isReady: computed,

			updateAuthTime: action,
			reset: action,
		});
	}

	async init(): Promise<void> {
		if (this.inited) return;
		this.inited = true;

		try {
			await this.checkAuth();
		} finally {
			this.isInitializing = false;
		}
	}

	protected reset(): void {
		this.lastAuthTime = 0;
	}
}
