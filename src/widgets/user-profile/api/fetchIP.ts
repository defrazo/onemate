import { API_URLS } from '@/shared/config/apiConfig';

// Получение IP адреса
export const getIP = async (): Promise<string> => {
	try {
		const url = `${API_URLS.ipify}`;
		const response = await fetch(url);
		const data = await response.json();

		return data.ip;
	} catch {
		return 'Не удалось определить';
	}
};
