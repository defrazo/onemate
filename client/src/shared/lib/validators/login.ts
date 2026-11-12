import { validateEmail } from './email';
import type { ValidationResult } from './types';
import { validateUsername } from './username';

export const validateLogin = (login: string): ValidationResult => {
	const normalized = login.trim();
	if (!normalized) return 'empty';

	return normalized.includes('@') ? validateEmail(normalized) : validateUsername(normalized);
};
