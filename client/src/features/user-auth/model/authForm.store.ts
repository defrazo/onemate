import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { type AuthData, type AuthType, createDefaultAuthForm } from '.';

const CONFIRM_TIMEOUT = 120;

export class AuthFormStore {
	private interval: ReturnType<typeof setInterval> | null = null;

	authForm: AuthData = createDefaultAuthForm();
	login = '';
	resetMode = false;
	timer = 0;

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

	get inviteCode(): string {
		return this.authForm.inviteCode;
	}

	get privacyAccepted(): boolean {
		return this.authForm.privacyAccepted;
	}

	get authType(): AuthType {
		return this.authForm.authType;
	}

	get isLogin(): boolean {
		return this.authType === 'login';
	}

	get isRegister(): boolean {
		return this.authType === 'register';
	}

	get isConfirm(): boolean {
		return this.authType === 'confirm';
	}

	get isReset(): boolean {
		return this.authType === 'reset';
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
		this.authForm.email = email;
		this.authForm.authType = 'confirm';

		this.startTimer();
	}

	startTimer(): void {
		this.clearTimer();
		this.timer = CONFIRM_TIMEOUT;

		this.interval = setInterval(() => {
			runInAction(() => {
				this.timer = Math.max(0, this.timer - 1);
				if (this.timer === 0) this.clearTimer();
			});
		}, 1000);
	}

	private clearTimer(): void {
		if (!this.interval) return;

		clearInterval(this.interval);
		this.interval = null;
	}

	constructor() {
		makeObservable(this, {
			authForm: observable,
			login: observable,
			resetMode: observable,
			timer: observable,

			username: computed,
			password: computed,
			passwordConfirm: computed,
			email: computed,
			inviteCode: computed,
			privacyAccepted: computed,
			authType: computed,
			isLogin: computed,
			isRegister: computed,
			isConfirm: computed,
			isReset: computed,

			update: action,
			setLogin: action,
			setResetMode: action,
			switchToConfirm: action,
			startTimer: action,
			reset: action,
		});
	}

	destroy(): void {
		this.clearTimer();
	}

	reset(): void {
		this.clearTimer();

		this.authForm = createDefaultAuthForm();
		this.login = '';
		this.resetMode = false;
		this.timer = 0;
	}
}
