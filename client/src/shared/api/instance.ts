import axios from 'axios';

export const api = axios.create({
	baseURL: '/api',
	timeout: 30000,
	withCredentials: true,
	withXSRFToken: true,
	headers: { Accept: 'application/json' },
});

export const csrf = async (): Promise<void> => {
	await axios.get('/sanctum/csrf-cookie', {
		withCredentials: true,
		withXSRFToken: true,
		headers: { Accept: 'application/json' },
	});
};
