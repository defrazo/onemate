/**
 * useValidation – хук для проверки данных формы.
 *
 * Использует валидаторы из shared/lib/validators и показывает уведомления
 * при ошибках проверки.
 *
 * Возвращает методы проверки для email, username, имени, пароля, логина и инвайт-кода.
 * Каждый метод возвращает true при успешной проверке и false при ошибке.
 */

import { useStore } from '@/app/providers';
import {
	validateEmail,
	validateInvite,
	validateLogin,
	validateName,
	validatePassword,
	validateUsername,
} from '@/shared/lib/validators';

export const useValidation = () => {
	const { notifyStore } = useStore();

	const notify = (msg: string) => notifyStore.setNotice(msg, 'info');

	const checkUsername = (value: string) => {
		const result = validateUsername(value);

		if (result === 'empty') {
			notify('Имя пользователя не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректное имя пользователя');
			return false;
		}

		return true;
	};

	const checkEmail = (value: string) => {
		const result = validateEmail(value);

		if (result === 'empty') {
			notify('E-mail не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректный формат e-mail');
			return false;
		}

		return true;
	};

	const checkLogin = (value: string) => {
		const result = validateLogin(value);

		if (result === 'empty') {
			notify('Логин не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректный логин');
			return false;
		}

		return true;
	};

	const checkName = (value: string) => {
		const result = validateName(value);

		if (result === 'empty') {
			notify('Имя не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректное имя');
			return false;
		}

		return true;
	};

	const checkPassword = (value: string) => {
		const result = validatePassword(value);

		if (result === 'empty') {
			notify('Пароль не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректный пароль');
			return false;
		}

		return true;
	};

	const checkInvite = (value: string) => {
		const result = validateInvite(value);

		if (result === 'empty') {
			notify('Инвайт-код не может быть пустым');
			return false;
		}

		if (result === 'invalid') {
			notify('Некорректный инвайт-код');
			return false;
		}

		return true;
	};

	return { checkUsername, checkEmail, checkName, checkLogin, checkPassword, checkInvite };
};
