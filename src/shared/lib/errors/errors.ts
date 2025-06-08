export class AbortRequestError extends Error {
	constructor() {
		super('Запрос был отменен. Пожалуйста, попробуйте снова.');
		this.name = 'AbortRequestError';
	}
}

export class NetworkError extends Error {
	constructor() {
		super('Отсутствует подключение к сети. Проверьте интернет-соединение.');
		this.name = 'NetworkError';
	}
}

export class ApiError extends Error {
	constructor() {
		super('Не удалось загрузить данные. Пожалуйста, попробуйте снова позже.');
		this.name = 'ApiError';
	}
}

export class EmptyResultError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmptyResultError';
	}
}
