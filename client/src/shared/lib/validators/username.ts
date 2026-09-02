export const validateUsername = (username: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = username.trim();
	if (!normalized) return 'empty';

	const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
	return usernameRegex.test(normalized) ? 'valid' : 'invalid';
};
