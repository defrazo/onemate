export type AuthType = 'login' | 'register';

export type User = {
	id: string;
	username: string;
	email: string;
	password?: string;
};
