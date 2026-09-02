import { validateEmail, validateUsername } from '.';

export const validateLogin = (login: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = login.trim();
	if (!normalized) return 'empty';

	return normalized.includes('@') ? validateEmail(normalized) : validateUsername(normalized);
};
