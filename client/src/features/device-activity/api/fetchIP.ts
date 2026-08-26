import { API_URLS } from '@/shared/lib/constants';
import { ApiError, EmptyResultError } from '@/shared/lib/errors';

export const fetchIP = async (): Promise<string> => {
	const maxAttempts = 3;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const response = await fetch(API_URLS.IPIFY);
			if (!response.ok) throw new ApiError();

			const data = await response.json();
			if (!data?.ip || typeof data.ip !== 'string') throw new EmptyResultError('Не удалось определить IP-адрес');

			return data.ip;
		} catch (error) {
			if (attempt === maxAttempts) throw error;
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	throw new EmptyResultError('Не удалось определить IP-адрес');
};
