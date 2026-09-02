export const validateName = (name: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = name.trim();
	if (!normalized) return 'empty';

	const nameRegex = /^[а-яёА-ЯЁa-zA-Z\s'-]{2,}$/;
	return nameRegex.test(normalized) ? 'valid' : 'invalid';
};
