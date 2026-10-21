import type { ValidationResult } from '.';

export const validateEmail = (email: string): ValidationResult => {
	const normalized = email.trim();
	if (!normalized) return 'empty';

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(normalized) ? 'valid' : 'invalid';
};
