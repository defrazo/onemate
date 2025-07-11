import { makeAutoObservable } from 'mobx';

import type { AuthData } from '.';

export class AuthFormStore {
	private defaultAuthForm: AuthData = {
		username: '',
		password: '',
		passwordConfirm: '',
		email: '',
		authType: 'login',
	};

	authForm: AuthData = {
		username: '',
		password: '',
		passwordConfirm: '',
		email: '',
		authType: 'login',
	};
	login: string = '';
	resetMode: boolean = false;
	timer: number = 0;
	timerInterval: NodeJS.Timeout | null = null;

	get username() {
		return this.authForm.username;
	}

	get password() {
		return this.authForm.password;
	}

	get passwordConfirm() {
		return this.authForm.passwordConfirm;
	}

	get email() {
		return this.authForm.email;
	}

	get authType() {
		return this.authForm.authType;
	}

	get isLogin() {
		return this.authForm.authType === 'login';
	}

	get isRegister() {
		return this.authForm.authType === 'register';
	}

	get isConfirm() {
		return this.authForm.authType === 'confirm';
	}

	get isReset() {
		return this.authForm.authType === 'reset';
	}

	update<K extends keyof AuthData>(field: K, value: AuthData[K]) {
		this.authForm[field] = value;
	}

	setLogin(value: string) {
		this.login = value;
	}

	setResetMode(value: boolean) {
		this.resetMode = value;
	}

	switchToConfirm(email: string) {
		this.update('email', email);
		this.update('authType', 'confirm');
		this.startTimer();
	}

	startTimer() {
		this.timer = 120;
		if (this.timerInterval) clearInterval(this.timerInterval);
		this.timerInterval = null;

		this.timerInterval = setInterval(() => {
			this.timer -= 1;
			if (this.timer <= 0) {
				clearInterval(this.timerInterval!);
				this.timerInterval = null;
			}
		}, 1000);
	}

	reset() {
		this.authForm = { ...this.defaultAuthForm };
		this.login = '';
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const authFormStore = new AuthFormStore();
