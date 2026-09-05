import { validateEmail, validateUsername, ValidationResult } from '.';

export const validateLogin = (login: string): ValidationResult => {
	const normalized = login.trim();
	if (!normalized) return 'empty';

	return normalized.includes('@') ? validateEmail(normalized) : validateUsername(normalized);
};
