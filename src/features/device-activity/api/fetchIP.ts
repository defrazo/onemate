import { API_URLS } from '@/shared/lib/constants';

// Получение IP адреса
export const fetchIP = async (): Promise<string> => {
	try {
		const url = `${API_URLS.IPIFY}`;
		const response = await fetch(url);
		const data = await response.json();

		return data.ip;
	} catch {
		return '';
	}
};
