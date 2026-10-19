import { action, computed, makeObservable, observable } from 'mobx';

import { type AuthData, type AuthType, createDefaultAuthForm } from '.';

export class AuthFormStore {
	authForm: AuthData = createDefaultAuthForm();
	login = '';
	resetMode = false;

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

	get isPrivacyAccepted(): boolean {
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

	get isForgot(): boolean {
		return this.authType === 'forgot';
	}

	update<K extends keyof AuthData>(field: K, value: AuthData[K]): void {
		this.authForm[field] = value;
	}

	setLogin(value: string): void {
		this.login = value;
	}

	switchToLogin(): void {
		this.authForm.authType = 'login';
		this.resetMode = false;
	}

	switchToRegister(): void {
		this.authForm.authType = 'register';
		this.resetMode = false;
	}

	switchToForgot(): void {
		this.authForm.authType = 'forgot';
		this.resetMode = true;
	}

	switchToConfirm(email?: string): void {
		if (email) this.authForm.email = email;
		this.authForm.authType = 'confirm';
	}

	constructor() {
		makeObservable(this, {
			authForm: observable,
			login: observable,
			resetMode: observable,

			username: computed,
			password: computed,
			passwordConfirm: computed,
			email: computed,
			inviteCode: computed,
			isPrivacyAccepted: computed,
			authType: computed,
			isLogin: computed,
			isRegister: computed,
			isConfirm: computed,
			isForgot: computed,

			update: action,
			setLogin: action,
			switchToLogin: action,
			switchToRegister: action,
			switchToForgot: action,
			switchToConfirm: action,
			reset: action,
		});
	}

	reset(): void {
		this.authForm = createDefaultAuthForm();
		this.login = '';
		this.resetMode = false;
	}
}
