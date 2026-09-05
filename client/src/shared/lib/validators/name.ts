import type { ValidationResult } from '.';

export const validateName = (name: string): ValidationResult => {
	const normalized = name.trim();
	if (!normalized) return 'empty';

	const nameRegex = /^[а-яёА-ЯЁa-zA-Z '-]{2,}$/;
	return nameRegex.test(normalized) ? 'valid' : 'invalid';
};
