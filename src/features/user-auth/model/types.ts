export type AuthData = {
	username: string;
	password: string;
	passwordConfirm?: string;
	email: string;
	authType: 'login' | 'register';
};
