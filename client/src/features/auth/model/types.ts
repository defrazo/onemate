export type AuthType = 'login' | 'register' | 'confirm' | 'forgot';

export type AuthData = {
	username: string;
	password: string;
	passwordConfirm: string;
	email: string;
	inviteCode: string;
	privacyAccepted: boolean;
	authType: AuthType;
};
