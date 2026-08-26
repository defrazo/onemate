import { makeAutoObservable } from 'mobx';

import type { IUserAuthPort } from '@/entities/user';
import { validateEmail, validatePasswords, validateUsername } from '@/shared/lib/validators';
import type { Status } from '@/shared/stores';

import { authApi } from '../api/auth';
import type { IAuthAccountPort, IAuthDevicePort } from '.';

export class AuthStore implements IAuthAccountPort, IAuthDevicePort {
	private inited = false;
	private status: Status = 'idle';
	private error: string | null = null;

	lastAuthTime = 0;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && !!this.userStore.id;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	async verifyInvite(inviteCode: string): Promise<string> {
		if (this.isLoading) throw new Error('Операция уже выполняется');

		this.setLoading();

		try {
			const { invite_token } = await authApi.verifyInvite(inviteCode.trim());

			this.setIdle();

			return invite_token;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async verifyEmail(id: string, hash: string, params: Record<string, string>): Promise<boolean> {
		this.setLoading();

		try {
			const { user } = await authApi.verifyEmail(id, hash, params);

			this.userStore.setUser(user);

			this.setReady();
			this.updateAuthTime();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async login(login: string, password: string): Promise<boolean> {
		if (this.isLoading) return false;

		this.setLoading();

		try {
			const { user } = await authApi.login({ login: login.trim(), password });

			this.userStore.setUser(user);

			this.setReady();
			this.updateAuthTime();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
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

		await validateUsername(username);
		await validateEmail(email);
		await validatePasswords(password, passwordConfirm);

		if (!privacyAccepted) throw new Error('Необходимо принять политику конфиденциальности');

		this.setLoading();

		try {
			await authApi.register({
				username: username.trim(),
				email: email.trim().toLowerCase(),
				password,
				password_confirmation: passwordConfirm,
				invite_token: inviteToken,
				privacy_accepted: privacyAccepted,
			});

			this.setIdle();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async resendConfirmation(email: string): Promise<boolean> {
		if (this.isLoading) return false;

		const normalizedEmail = email.trim().toLowerCase();

		await validateEmail(normalizedEmail);

		this.setLoading();

		try {
			await authApi.resendVerification(normalizedEmail);

			this.setIdle();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async forgotPassword(email: string): Promise<boolean> {
		if (this.isLoading) return false;

		const normalizedEmail = email.trim().toLowerCase();

		await validateEmail(normalizedEmail);

		this.setLoading();

		try {
			await authApi.forgotPassword({ email: normalizedEmail });

			this.setIdle();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async resetPassword(email: string, token: string, password: string, passwordConfirm: string): Promise<boolean> {
		if (this.isLoading) return false;

		const normalizedEmail = email.trim().toLowerCase();

		await validateEmail(normalizedEmail);
		await validatePasswords(password, passwordConfirm);

		this.setLoading();

		try {
			await authApi.resetPassword({
				email: normalizedEmail,
				token,
				password,
				password_confirmation: passwordConfirm,
			});

			this.setIdle();

			return true;
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	async logout(): Promise<void> {
		try {
			await authApi.logout();
		} finally {
			this.reset();
		}
	}

	private async checkAuth(): Promise<void> {
		this.setLoading();

		try {
			const { authenticated, user } = await authApi.getSession();

			if (!authenticated || !user) {
				this.reset();
				return;
			}

			this.userStore.setUser(user);
			this.setReady();
		} catch (error) {
			this.setError(error);
			throw error;
		}
	}

	private updateAuthTime(): void {
		this.lastAuthTime = Date.now();
	}

	constructor(private readonly userStore: IUserAuthPort) {
		makeAutoObservable<this, 'userStore' | 'inited'>(this, {
			userStore: false,
			inited: false,
		});
	}

	async init(): Promise<void> {
		if (this.inited) return;

		await this.checkAuth();

		this.inited = true;
	}

	destroy(): void {
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

	private setIdle(): void {
		this.status = 'idle';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.lastAuthTime = 0;
		this.userStore.reset();
	}
}
