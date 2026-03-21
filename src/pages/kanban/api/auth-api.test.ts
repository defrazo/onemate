import type { AuthError, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { supabase } from '@/shared/lib/supabase';

import { getCurrentUser } from './auth-api';

vi.mock('@/shared/lib/supabase', () => ({
	supabase: {
		auth: { getUser: vi.fn() },
	},
}));

const makeFakeUser = (overrides?: Partial<User>): User =>
	({
		id: '123',
		email: 'test@example.com',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		created_at: new Date().toISOString(),
		...overrides,
	}) as User;

const makeFakeAuthError = (message: string): AuthError =>
	({
		message,
		name: 'AuthError',
		status: 400,
		code: 'unexpected_failure',
		__isAuthError: true,
	}) as unknown as AuthError;

const mockGetUser = (response: any) => {
	vi.mocked(supabase.auth.getUser).mockResolvedValueOnce(response);
};

describe('getCurrentUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return user when request succeeds', async () => {
		// ARRANGE
		const fakeUser = makeFakeUser();
		mockGetUser({ data: { user: fakeUser }, error: null });

		// ACT
		const result = await getCurrentUser();

		// ASSERT
		expect(result).toEqual(fakeUser);
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		const fakeError = makeFakeAuthError('Ошибка сети');
		mockGetUser({ data: { user: null }, error: fakeError });

		// ACT + ASSERT
		await expect(getCurrentUser()).rejects.toThrow('Ошибка сети');
	});

	it('should throw error when user not logged in', async () => {
		// ARRANGE
		mockGetUser({ data: { user: null }, error: null });

		// ACT + ASSERT
		await expect(getCurrentUser()).rejects.toThrow('Пользователь не авторизован');
	});

	it('should call getUser once when request is made', async () => {
		// ARRANGE
		mockGetUser({ data: { user: makeFakeUser() }, error: null });

		// ACT
		await getCurrentUser();

		// ASSERT
		expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
	});
});
