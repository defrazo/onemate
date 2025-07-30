export const validatePasswords = (password: string, passwordConfirm: string): Promise<boolean> => {
	if (!passwordConfirm) return Promise.reject(new Error('Подтверждение пароля обязательно'));

	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

	if (!passwordRegex.test(password)) {
		return Promise.reject(
			new Error(
				'Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну строчную букву и одну цифру'
			)
		);
	}

	if (password !== passwordConfirm) return Promise.reject(new Error('Введенные пароли не совпадают'));

	return Promise.resolve(true);
};
