export const validatePhone = (phone: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = phone.trim();
	if (!normalized) return 'empty';

	const phoneRegex = /^[\d\s()+-]+$/;
	if (!phoneRegex.test(normalized)) return 'invalid';

	const digitsOnly = normalized.replace(/\D/g, '');
	return digitsOnly.length >= 10 ? 'valid' : 'invalid';
};
