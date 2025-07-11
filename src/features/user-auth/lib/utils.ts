import { notifyStore } from '@/shared/stores';

import type { PasswordRule } from '../model';

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

export const validateEmail = (email: string): Promise<boolean> => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
	if (!emailRegex.test(email)) return Promise.reject(new Error('Некорректный формат e-mail'));

	const [name, domain] = email.split('@');
	if (!name || name.length < 2) return Promise.reject(new Error('Имя пользователя в e-mail слишком короткое'));

	const domainParts = domain.split('.');
	const sld = domainParts[0];
	const tld = domainParts[domainParts.length - 1];

	if (!sld || sld.length < 2) return Promise.reject(new Error('Домен в e-mail слишком короткий'));

	if (!tld || tld.length < 2) return Promise.reject(new Error('Некорректное окончание домена'));

	return Promise.resolve(true);
};

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

export const validatePassword = (value: string): boolean => {
	if (/[А-Яа-яЁё]/.test(value)) {
		notifyStore.setError('Пароль не должен содержать русские буквы');
		return false;
	}

	return true;
};

export const passwordRules: PasswordRule[] = [
	{ label: 'Минимум 8 символов', test: (pass: string) => pass.length >= 8 },
	{ label: 'Заглавная буква', test: (pass: string) => /[A-Z]/.test(pass) },
	{ label: 'Строчная буква', test: (pass: string) => /[a-z]/.test(pass) },
	{ label: 'Цифра', test: (pass: string) => /\d/.test(pass) },
];
