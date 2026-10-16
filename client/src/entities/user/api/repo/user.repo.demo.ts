import { RestrictedAccess } from '@/shared/lib/errors';
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

	async updateEmail(_email: string, _currentPassword: string): Promise<User> {
		throw new RestrictedAccess();
	}

	async updatePassword(_currentPassword: string, _password: string, _passwordConfirmation: string): Promise<User> {
		throw new RestrictedAccess();
	}

	async verifyPendingEmail(): Promise<User> {
		throw new RestrictedAccess();
	}

	async resendPendingEmail(): Promise<void> {
		throw new RestrictedAccess();
	}

	async cancelPendingEmail(): Promise<User> {
		throw new RestrictedAccess();
	}

	async deleteAccount(): Promise<User> {
		throw new RestrictedAccess();
	}

	async restoreAccount(): Promise<User> {
		throw new RestrictedAccess();
	}
}
