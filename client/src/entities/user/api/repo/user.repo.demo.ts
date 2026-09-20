import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserRepo, User } from '../../model';

export class UserRepoDemo implements IUserRepo {
	constructor(private readonly getCurrentUser: () => User | null) {}

	async loadUser(): Promise<User> {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const stored = storage.get(key(user.id, 'user'));
		if (stored && typeof stored === 'object') return structuredClone(stored as User);

		const initial = structuredClone(toPlain(user) as User);
		storage.set(key(user.id, 'user'), initial);
		return initial;
	}

	async updateUsername(username: string): Promise<User> {
		const user = await this.loadUser();

		const updated: User = { ...user, username, updated_at: new Date().toISOString() };
		storage.set(key(user.id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	async updateEmail(email: string, _currentPassword: string): Promise<User> {
		const user = await this.loadUser();

		const updated: User = { ...user, email, updated_at: new Date().toISOString() };
		storage.set(key(user.id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	async updatePassword(_currentPassword: string, _password: string, _passwordConfirmation: string): Promise<User> {
		const user = await this.loadUser();

		const updated: User = { ...user, updated_at: new Date().toISOString() };
		storage.set(key(user.id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	async verifyPendingEmail(): Promise<User> {
		throw new Error('Смена e-mail недоступна в демо-версии');
	}

	async resendPendingEmail(): Promise<void> {
		throw new Error('Смена e-mail недоступна в демо-версии');
	}

	async cancelPendingEmail(): Promise<User> {
		throw new Error('Смена e-mail недоступна в демо-версии');
	}

	async deleteAccount(): Promise<User> {
		throw new Error('Удаление аккаунта недоступно в демо-режиме');
	}

	async restoreAccount(): Promise<User> {
		throw new Error('Восстановление аккаунта недоступно в демо-режиме');
	}
}
