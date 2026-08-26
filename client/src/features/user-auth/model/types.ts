export type AuthType = 'login' | 'register' | 'confirm' | 'reset';

export type AuthData = {
	username: string;
	password: string;
	passwordConfirm: string;
	email: string;
	inviteCode: string;
	privacyAccepted: boolean;
	authType: AuthType;
};

export type PasswordRule = {
	label: string;
	test: (pass: string) => boolean;
};
