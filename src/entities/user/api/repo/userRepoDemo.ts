import type { User } from '@supabase/supabase-js';

import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserRepo } from '../../model';

export class UserRepoDemo implements IUserRepo {
	constructor(private readonly getCurrentUser: () => User | null) {}

	async loadUser(): Promise<User> {
		const id = this.getId();

		const stored = storage.get(key(id, 'user'));
		if (stored && typeof stored === 'object') return structuredClone(this.normalize(stored as User));

		const initial = this.cloneUser() as User;
		storage.set(key(id, 'user'), initial);
		return initial;
	}

	async updateUsername(username: string): Promise<User> {
		const id = this.getId();

		const user = await this.loadUser();
		const updated: User = this.normalize({
			...(user as any),
			user_metadata: { ...(user.user_metadata ?? {}), username },
		});

		storage.set(key(id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	async updateEmail(email: string): Promise<User> {
		const id = this.getId();

		const user = await this.loadUser();
		const updated: User = this.normalize({ ...(user as any), email });

		storage.set(key(id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	async updatePassword(_password: string): Promise<User> {
		const id = this.getId();

		const user = await this.loadUser();
		const updated: User = this.normalize({
			...(user as any),
			user_metadata: {
				...(user.user_metadata ?? {}),
				password_changed_at: new Date().toISOString(),
			},
		});

		storage.set(key(id, 'user'), toPlain(updated));
		return structuredClone(updated);
	}

	private normalize(user: User): User {
		return {
			...(user as any),
			user_metadata: { ...(user.user_metadata ?? {}) },
			app_metadata: { ...(user.app_metadata ?? {}) },
		} as User;
	}

	private getId(): string {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Что-то пошло не так');
		return user.id;
	}

	private cloneUser(): User {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Что-то пошло не так');
		return this.normalize(toPlain(user)) as User;
	}
}
