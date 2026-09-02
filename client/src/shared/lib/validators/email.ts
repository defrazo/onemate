export const validateEmail = (email: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = email.trim();
	if (!normalized) return 'empty';

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(normalized) ? 'valid' : 'invalid';
};
