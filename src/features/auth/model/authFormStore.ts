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

	constructor() {
		makeAutoObservable(this);
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
}

export const authFormStore = new AuthFormStore();
