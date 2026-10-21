import axios from 'axios';

import { handleLaravelError } from '@/shared/lib/errors';

export const api = axios.create({
	baseURL: '/api',
	timeout: 30000,
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
		withCredentials: true,
		withXSRFToken: true,
		headers: { Accept: 'application/json' },
	});
};
