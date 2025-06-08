import { notify } from '@/shared/lib/notify';

export const validateUsername = (username: string): Promise<boolean> => {
	const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

	if (!usernameRegex.test(username)) {
		return Promise.reject(
			new Error(
				'Имя пользователя должно содержать минимум 3 символа и включать только латинские буквы, цифры и символ подчеркивания.'
			)
		);
	}

	return Promise.resolve(true);
};

export const validateEmail = (email: string): Promise<boolean> => {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (email.length < 6) {
		return Promise.reject(new Error('Адрес электронной почты должен содержать не менее 6 символов.'));
	}

	if (!emailRegex.test(email)) {
		return Promise.reject(new Error('Некорректный формат e-mail.'));
	}

	return Promise.resolve(true);
};

export const validatePasswords = (password: string, passwordConfirm: string | undefined): Promise<boolean> => {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

	if (!passwordRegex.test(password)) {
		return Promise.reject(
			new Error(
				'Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну строчную букву и одну цифру.'
			)
		);
	}

	if (password !== passwordConfirm) {
		return Promise.reject(new Error('Введенные пароли не совпадают.'));
	}

	return Promise.resolve(true);
};

export const validatePassword = (value: string) => {
	if (/[А-Яа-яЁё]/.test(value)) {
		notify.error('Пароль не должен содержать русские буквы');

		return false;
	}

	return true;
};
