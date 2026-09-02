import axios from 'axios';

const errorMessages: Record<string, string> = {
	INVALID_INVITE: 'Некорректный инвайт-код',
	PRIVACY_NOT_ACCEPTED: 'Требуется согласие на ПД',
	INVALID_USERNAME: 'Некорректное имя пользователя',
	EMAIL_TAKEN: 'Этот e-mail уже занят',
	INVALID_EMAIL: 'Некорректный формат e-mail',
	INVALID_PASSWORD: 'Некорректный пароль',
	REGISTRATION_ERROR: 'Не удалось зарегистрироваться',
	INVALID_CREDENTIALS: 'Неверное имя пользователя, e-mail или пароль',
};

export const handleLaravelError = (error: unknown): never => {
	if (axios.isAxiosError<{ code?: string }>(error)) {
		const code = error.response?.data?.code;

		if (code && errorMessages[code]) throw new Error(errorMessages[code]);

		throw error;
	}

	if (error instanceof Error) throw error;

	throw new Error('Что-то пошло не так');
};
