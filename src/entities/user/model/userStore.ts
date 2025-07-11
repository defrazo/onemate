import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage';

import { User } from '.';

export class UserStore {
	user: User | null = null;

	get id(): string {
		return this.user?.id || '';
	}

	get username(): string {
		return this.user?.username || '';
	}

	get password(): string {
		return this.user?.password || '';
	}

	get email(): string {
		return this.user?.email || '';
	}

	setUser(user: User | null) {
		this.user = user;
	}

	updateUsername(username: string) {
		if (this.user) {
			this.user.username = username;
			this.syncUser(this.user);
			this.syncToUsers(this.user);
		}
	}

	updateEmail(email: string) {
		if (this.user) {
			this.user.email = email;
			this.syncUser(this.user);
			this.syncToUsers(this.user);
		}
	}

	private syncUser(user: User | null) {
		storage.set('user', user);
	}

	private syncToUsers(user: User) {
		const users: User[] = storage.get('users') || [];
		const index = users.findIndex((u) => u.id === user.id);

		if (index !== -1) users[index] = user;
		else users.push(user);

		storage.set('users', users);
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const userStore = new UserStore();
