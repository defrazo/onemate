import type { Provider } from '@supabase/supabase-js';
import { makeAutoObservable } from 'mobx';

import type { IUserAuthPort } from '@/entities/user';
import type { Status } from '@/shared/stores';

import type { IAuthAccountPort, IAuthDevicePort } from '.';
import { authService } from '.';

export class AuthStore implements IAuthAccountPort, IAuthDevicePort {
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private isAuth: boolean = false;

	lastAuthTime: number = 0;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.isAuth === true;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	async startOAuth(provider: Provider): Promise<void> {
		await authService.oAuth(provider);
	}

	async finishOAuth(): Promise<boolean> {
		await this.userStore.loadUser();

		// ⚠️ Ограничение доступа для предотвращения обработки персональных данных
		const email = Array.isArray(this.userStore.email) ? this.userStore.email[0] : this.userStore.email;
		let currentEmail = email?.toLowerCase().trim() ?? null;

		if (!currentEmail) {
			const email = await authService.getCurrentEmail();
			currentEmail = email?.toLowerCase().trim() ?? null;
		}

		const env = (import.meta.env.VITE_ALLOWED_EMAILS ?? '') as string;
		const allowed = env
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean);

		if (!currentEmail || !allowed.includes(currentEmail)) {
			await authService.logout();
			throw new Error('Доступ только для разработчика');
		}

		this.setReady();
		this.updateAuthTime();

		return true;
	}

	async login(login: string, password: string): Promise<boolean> {
		const result = await authService.login(login, password);
		if (result) {
			this.setReady();
			this.updateAuthTime();
		}
		return result;
	}

	async register(username: string, email: string, password: string, passwordConfirm: string): Promise<boolean> {
		return await authService.register(username, email, password, passwordConfirm);
	}

	logout(): void {
		this.reset();
		void authService.logout();
	}

	async resendConfirmation(email: string): Promise<boolean> {
		return await authService.resendConfirmation(email);
	}

	async resetPassword(password: string): Promise<boolean> {
		return await authService.resetPassword(password);
	}

	private updateAuthTime(): void {
		this.lastAuthTime = Date.now();
	}

	private async checkAuth(): Promise<void> {
		if (this.isLoading) return;

		this.setLoading();

		try {
			await this.userStore.loadUser();
			this.userStore.id ? this.setReady() : this.reset();
		} catch (error) {
			this.setError(error);
		}
	}

	constructor(private readonly userStore: IUserAuthPort) {
		makeAutoObservable<this, 'userStore' | 'inited'>(this, {
			userStore: false,
			inited: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		void this.checkAuth();
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
		this.isAuth = true;
	}

	private setError(error: unknown): void {
		this.status = 'error';
		this.error = error instanceof Error ? error.message : String(error);
		this.isAuth = false;
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.isAuth = false;
		this.userStore.reset();
	}
}
