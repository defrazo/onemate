import { storage } from '@/shared/lib/storage/localStorage';
import { generateUUID } from '@/shared/lib/utils';

import type { User } from '../model';

export const checkUser = (username: string, email: string, password?: string): User => {
	const existingUsers: User[] = storage.get('users') || [];
	const normalizedEmail = email ? email.toLowerCase() : '';

	let user = existingUsers.find((u) => u.email === normalizedEmail);

	if (!user) {
		user = {
			id: generateUUID(),
			email: normalizedEmail,
			username: username ? username : 'Пользователь',
			password,
		};

		existingUsers.push(user);
		storage.set('users', existingUsers);
	} else if (password) throw new Error('Пользователь с таким e-mail уже зарегистрирован.');

	return user;
};
