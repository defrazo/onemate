import { makeAutoObservable, runInAction } from 'mobx';

import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { deviceActivityStore } from '@/features/device-activity';

import { authFormStore, authService } from '.';

export class AuthStore {
	isAuthChecked = false;

	async oAuth({ data, error }: { data: any; error: any }): Promise<boolean> {
		try {
			const result = await authService.oAuth({ data, error });
			if (result) {
				await userStore.loadUser();
				await userProfileStore.loadProfile();
				await deviceActivityStore.logAuthOnce();
				authFormStore.reset();
			}
			return result;
		} catch (error) {
			throw error;
		}
	}

	async login(): Promise<boolean> {
		const { login, password } = authFormStore;
		try {
			const result = await authService.login(login, password);
			if (result) {
				await userStore.loadUser();
				await userProfileStore.loadProfile();
				await deviceActivityStore.logAuthOnce();
				authFormStore.reset();
			}
			return result;
		} catch (error) {
			throw error;
		}
	}

	async register(): Promise<boolean> {
		const data = authFormStore.authForm;
		try {
			const result = await authService.register(data);
			if (result) {
				await userStore.loadUser();
				authFormStore.reset();
			}
			return result;
		} catch (error) {
			throw error;
		}
	}

	async logout() {
		await authService.logout();
	}

	async init() {
		await userStore.loadSession();
		runInAction(() => {
			this.isAuthChecked = true;
		});
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const authStore = new AuthStore();
