import { makeAutoObservable, runInAction } from 'mobx';

import { createDefaultAuthForm } from '@/shared/lib/constants';

import type { AuthData, AuthType } from '.';

export class AuthFormStore {
	private interval: ReturnType<typeof setInterval> | null = null;
	private inited: boolean = false;

	authForm: AuthData = createDefaultAuthForm();
	login: string = '';
	resetMode: boolean = false;
	timer: number = 0;

	get username(): string {
		return this.authForm.username;
	}

	get password(): string {
		return this.authForm.password;
	}

	get passwordConfirm(): string {
		return this.authForm.passwordConfirm;
	}

	get email(): string {
		return this.authForm.email;
	}

	get authType(): AuthType {
		return this.authForm.authType;
	}

	get isLogin(): boolean {
		return this.authForm.authType === 'login';
	}

	get isRegister(): boolean {
		return this.authForm.authType === 'register';
	}

	get isConfirm(): boolean {
		return this.authForm.authType === 'confirm';
	}

	get isReset(): boolean {
		return this.authForm.authType === 'reset';
	}

	update<K extends keyof AuthData>(field: K, value: AuthData[K]): void {
		this.authForm[field] = value;
	}

	setLogin(value: string): void {
		this.login = value;
	}

	setResetMode(value: boolean): void {
		this.resetMode = value;
	}

	switchToConfirm(email: string): void {
		this.update('email', email);
		this.update('authType', 'confirm');
		this.startTimer();
	}

	startTimer(): void {
		this.clearInterval();
		this.timer = 120;
		this.interval = setInterval(() => {
			runInAction(() => {
				this.timer = Math.max(0, this.timer - 1);
				if (this.timer === 0) this.clearInterval();
			});
		}, 1000);
	}

	constructor() {
		makeAutoObservable<this, 'inited' | 'interval'>(this, {
			inited: false,
			interval: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.clearInterval();
		this.inited = false;
	}

	reset(): void {
		this.authForm = createDefaultAuthForm();
		this.login = '';
		this.timer = 0;
		this.resetMode = false;
		this.clearInterval();
	}

	private clearInterval(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}
