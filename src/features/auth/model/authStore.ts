import { makeAutoObservable, runInAction } from 'mobx';

import { authFormStore, authService } from '.';

export class AuthStore {
	isAuthenticated: boolean = false;
	isAuthChecked: boolean = false;

	constructor() {
		makeAutoObservable(this);
		this.checkAuth();
	}

	private setAuthState(isAuthenticated: boolean) {
		runInAction(() => {
			this.isAuthenticated = isAuthenticated;
			this.isAuthChecked = true;
		});
	}

	async oAuth({ data, error }: { data: any; error: any }): Promise<boolean> {
		const authData = { data, error };

		try {
			const result = await authService.oAuth(authData);
			this.setAuthState(result);

			return result;
		} catch (error) {
			this.setAuthState(false);

			throw error;
		}
	}

	async login(): Promise<boolean> {
		const authData = authFormStore.authForm;

		try {
			const result = await authService.login(authData);
			this.setAuthState(result);

			return result;
		} catch (error) {
			this.setAuthState(false);

			throw error;
		}
	}

	async register(): Promise<boolean> {
		const authData = authFormStore.authForm;

		try {
			const result = await authService.register(authData);
			this.setAuthState(result);

			return result;
		} catch (error) {
			this.setAuthState(false);

			throw error;
		}
	}

	logout() {
		authService.logout();
		this.setAuthState(false);
	}

	checkAuth() {
		this.isAuthenticated = authService.checkAuth();
		this.isAuthChecked = true;
	}
}

export const authStore = new AuthStore();
