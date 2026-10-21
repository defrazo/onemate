import { api } from '@/shared/api';

import type { IUserRepo, User } from '../../model';

type UserResponse = {
	user: User;
};

export class UserRepoLaravel implements IUserRepo {
	async loadUser(): Promise<User> {
		const { data } = await api.get<UserResponse>('/user');
		return data.user;
	}

	async updateUsername(username: string): Promise<User> {
		const { data } = await api.patch<UserResponse>('/user/username', { username });
		return data.user;
	}

	async updateEmail(email: string, currentPassword: string): Promise<User> {
		const { data } = await api.patch<UserResponse>('/user/email', {
			email,
			current_password: currentPassword,
		});

		return data.user;
	}

	async updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<User> {
		const { data } = await api.patch<UserResponse>('/user/password', {
			current_password: currentPassword,
			password,
			password_confirmation: passwordConfirmation,
		});
		return data.user;
	}

	async verifyPendingEmail(id: string, hash: string, params: Record<string, string>): Promise<User> {
		const { data } = await api.get<{ user: User }>(`/user/email/verify/${id}/${hash}`, { params });
		return data.user;
	}

	async resendPendingEmail(): Promise<void> {
		await api.post('/user/email/resend');
	}

	async cancelPendingEmail(): Promise<User> {
		const { data } = await api.delete<UserResponse>('/user/email/pending');
		return data.user;
	}

	async deleteAccount(): Promise<User> {
		const { data } = await api.delete<UserResponse>('/user');
		return data.user;
	}

	async restoreAccount(): Promise<User> {
		const { data } = await api.post<UserResponse>('/user/restore');
		return data.user;
	}
}
