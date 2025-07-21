export const validateUsername = (username: string): Promise<boolean> => {
	const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

	if (!usernameRegex.test(username)) {
		return Promise.reject(
			new Error(
				'Имя пользователя должно содержать минимум 3 символа и включать только латинские буквы, цифры и символ подчеркивания'
			)
		);
	}

	return Promise.resolve(true);
};
