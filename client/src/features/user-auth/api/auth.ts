import { api, csrf } from '@/shared/api';

import type {
	AuthResponse,
	AuthSessionResponse,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResetPasswordPayload,
	VerifyInviteResponse,
} from '.';

export const authApi = {
	async verifyInvite(inviteCode: string): Promise<VerifyInviteResponse> {
		await csrf();

		const { data } = await api.post<VerifyInviteResponse>('/invite/verify', { invite_code: inviteCode });
		return data;
	},

	async verifyEmail(id: string, hash: string, params: Record<string, string>): Promise<AuthResponse> {
		await csrf();

		const { data } = await api.get<AuthResponse>(`/email/verify/${id}/${hash}`, { params });
		return data;
	},

	async register(payload: RegisterPayload): Promise<void> {
		await csrf();
		await api.post('/register', payload);
	},

	async login(payload: LoginPayload): Promise<AuthResponse> {
		await csrf();
		const { data } = await api.post<AuthResponse>('/login', payload);
		return data;
	},

	async getSession(): Promise<AuthSessionResponse> {
		const { data } = await api.get<AuthSessionResponse>('/auth/session');
		return data;
	},

	async getCurrentUser(): Promise<AuthResponse> {
		const { data } = await api.get<AuthResponse>('/user');
		return data;
	},

	async logout(): Promise<void> {
		await csrf();
		await api.post('/logout');
	},

	async resendVerification(email: string): Promise<void> {
		await csrf();
		await api.post('/email/resend', { email: email.trim().toLowerCase() });
	},

	async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
		await csrf();
		await api.post('/forgot-password', { email: payload.email.trim().toLowerCase() });
	},

	async resetPassword(payload: ResetPasswordPayload): Promise<void> {
		await csrf();
		await api.post('/reset-password', { ...payload, email: payload.email.trim().toLowerCase() });
	},
};
