export const validateLogin = (login: string): Promise<boolean> => {
	if (!login) return Promise.reject(new Error('Введите логин или e-mail'));

	if (login.includes('@')) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(login)) return Promise.reject(new Error('Неверный формат e-mail'));
	} else {
		const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
		if (!usernameRegex.test(login))
			return Promise.reject(
				new Error(
					'Имя пользователя должно содержать минимум 3 символа и включать только латинские буквы, цифры и символ подчеркивания'
				)
			);
	}

	return Promise.resolve(true);
};
