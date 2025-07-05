import { makeAutoObservable } from 'mobx';

import type { AuthData } from '.';

export class AuthFormStore {
	authForm: AuthData = {
		username: '',
		password: '',
		passwordConfirm: '',
		email: '',
		authType: 'login',
	};

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

	update<K extends keyof AuthData>(field: K, value: AuthData[K]) {
		this.authForm[field] = value;
	}

	reset() {
		this.authForm = {
			username: '',
			password: '',
			passwordConfirm: '',
			email: '',
			authType: 'login',
		};
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const authFormStore = new AuthFormStore();
