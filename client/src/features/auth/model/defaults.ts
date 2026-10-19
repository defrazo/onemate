import type { AuthData } from '.';

const DEFAULT_AUTHFORM: AuthData = {
	username: '',
	password: '',
	passwordConfirm: '',
	email: '',
	inviteCode: '',
	privacyAccepted: false,
	authType: 'login',
};
export const createDefaultAuthForm = (): AuthData => ({ ...DEFAULT_AUTHFORM });
