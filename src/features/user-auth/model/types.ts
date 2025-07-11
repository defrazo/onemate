export type AuthData = {
	username: string;
	password: string;
	passwordConfirm: string;
	email: string;
	authType: AuthType;
};

export type AuthType = 'login' | 'register' | 'confirm' | 'reset';

export type PasswordRule = {
	label: string;
	test: (pass: string) => boolean;
};

export type SupabaseUserCheck = {
	id: string;
	email_confirmed_at: string | null;
};
