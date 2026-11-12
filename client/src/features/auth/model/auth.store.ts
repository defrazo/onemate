import { action, computed, makeObservable, observable } from 'mobx';

import type { IUserAuthPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { authApi } from '../api';
import { authChannel } from '../lib';
import type { IAuthDevicePort } from '.';

export class AuthStore extends AsyncStore implements IAuthDevicePort {
	private authVersion = 0;
	private logoutPromise: Promise<boolean> | null = null;
	private logoutGuard: (userId: string) => Promise<'saved' | 'discard' | false> = async () => 'saved';
	private discardNotes: (userId: string) => void = () => {};

	isInitializing = true;
	lastAuthTime = 0;
	isLoggingOut = false;

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

	setLogoutGuard(
		guard: (userId: string) => Promise<'saved' | 'discard' | false>,
		discard: (userId: string) => void
	): void {
		this.logoutGuard = guard;
		this.discardNotes = discard;
	}

	logout(): Promise<boolean> {
		if (this.logoutPromise) return this.logoutPromise;

		this.isLoggingOut = true;
		const promise = this.performLogout().finally(
			action(() => {
				this.logoutPromise = null;
				this.isLoggingOut = false;
			})
		);
		this.logoutPromise = promise;

		return promise;
	}

	private async performLogout(): Promise<boolean> {
		const userId = this.userStore.id;
		if (!userId) return true;

		const decision = await this.logoutGuard(userId);
		if (!decision || this.userStore.id !== userId) return false;

		try {
			await authApi.logout();

			authChannel.postMessage({ type: 'logout', userId, discardNotes: decision === 'discard' });
		} finally {
			if (this.userStore.id === userId) {
				if (decision === 'discard') this.discardNotes(userId);
				this.endSession();
			}
		}

		return true;
	}

	endSession(): void {
		this.authVersion++;
		this.userStore.clearSession();
		this.reset();
	}

	private async checkAuth(): Promise<void> {
		const version = this.authVersion;
		const { authenticated, user } = await authApi.getSession();

		if (version !== this.authVersion) return;

		if (!authenticated || !user) {
			this.userStore.setUser(null);
			return;
		}

		this.userStore.setUser(user);
	}

	private updateAuthTime(): void {
		this.lastAuthTime = Date.now();
	}

	private readonly handleAuthMessage = (event: MessageEvent) => {
		if (event.data?.type !== 'logout') return;
		if (event.data.userId && event.data.userId !== this.userStore.id) return;
		if (event.data.discardNotes && this.userStore.id) this.discardNotes(this.userStore.id);

		this.endSession();
	};

	constructor(private readonly userStore: IUserAuthPort) {
		super();

		makeObservable<this, 'updateAuthTime' | 'reset'>(this, {
			isInitializing: observable,
			lastAuthTime: observable,
			isLoggingOut: observable,
			isReady: computed,

			updateAuthTime: action,
			reset: action,
			logout: action,
			endSession: action,
		});
	}

	async init(): Promise<void> {
		if (this.inited) return;
		this.inited = true;

		authChannel.addEventListener('message', this.handleAuthMessage);

		this.track(() => authChannel.removeEventListener('message', this.handleAuthMessage));

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
