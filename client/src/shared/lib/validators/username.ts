import type { ValidationResult } from './types';

export const validateUsername = (username: string): ValidationResult => {
	const normalized = username.trim();
	if (!normalized) return 'empty';

	const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
	return usernameRegex.test(normalized) ? 'valid' : 'invalid';
};
