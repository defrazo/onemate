import axios from 'axios';

import { handleLaravelError } from '@/shared/lib/errors';

const REQUEST_TIMEOUT = 30_000;

export const api = axios.create({
	baseURL: '/api',
	timeout: REQUEST_TIMEOUT,
	withCredentials: true,
	withXSRFToken: true,
	headers: { Accept: 'application/json' },
});

api.interceptors.response.use(
	(response) => response,
	(error: unknown) => handleLaravelError(error)
);

export const csrf = async (): Promise<void> => {
	await axios.get('/sanctum/csrf-cookie', {
		timeout: REQUEST_TIMEOUT,
		withCredentials: true,
		withXSRFToken: true,
		headers: { Accept: 'application/json' },
	});
};
