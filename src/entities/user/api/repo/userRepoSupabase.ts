import type { User } from '@supabase/supabase-js';

import type { IUserRepo } from '../../model';
import { userService } from '../../model';

export class UserRepoSupabase implements IUserRepo {
	async loadUser(): Promise<User> {
		const user = await userService.getUser();
		if (!user) throw new Error('Нет активной сессии');
		return user;
	}

	async updateUsername(username: string): Promise<User> {
		const user = await userService.updateUsername(username);
		if (!user) throw new Error('Не удалось обновить имя пользователя');
		return user;
	}

	async updateEmail(email: string): Promise<User> {
		const user = await userService.updateEmail(email);
		if (!user) throw new Error('Не удалось обновить e-mail пользователя');
		return user;
	}

	async updatePassword(password: string): Promise<User> {
		const user = await userService.updatePassword(password);
		if (!user) throw new Error('Не удалось обновить пароль');
		return user;
	}
}
