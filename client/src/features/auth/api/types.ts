import type { User } from '@/entities/user';

export interface AuthResponse {
	code?: string;
	user: User;
}

export interface VerifyInviteResponse {
	invite_token: string;
}

export interface AuthSessionResponse {
	authenticated: boolean;
	user: User | null;
}

export interface LoginPayload {
	login: string;
	password: string;
}

export interface RegisterPayload {
	username: string;
	email: string;
	password: string;
	password_confirmation: string;
	invite_token: string;
	privacy_accepted: boolean;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ResetPasswordPayload {
	email: string;
	token: string;
	password: string;
	password_confirmation: string;
}
