import { AbortRequestError, ApiError, EmptyResultError, NetworkError } from './errors';

export const handleError = (error: unknown): never => {
	if (error instanceof AbortRequestError) throw error;

	if (error instanceof TypeError && error.message?.includes('fetch')) throw new NetworkError();

	if (error instanceof ApiError) throw error;

	if (error instanceof EmptyResultError) throw error;

	if (error instanceof Error) throw error;

	throw new Error('Произошла неизвестная ошибка');
};
