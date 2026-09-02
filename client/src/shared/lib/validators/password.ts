export const validatePassword = (password: string): 'empty' | 'invalid' | 'valid' => {
	if (!password) return 'empty';

	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
	return passwordRegex.test(password) ? 'valid' : 'invalid';
};
