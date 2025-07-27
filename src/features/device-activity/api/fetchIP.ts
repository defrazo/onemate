import { IPIFY_API_URL } from '@/shared/lib/constants';

// Получение IP адреса
export const getIP = async (): Promise<string> => {
	try {
		const url = `${IPIFY_API_URL}`;
		const response = await fetch(url);
		const data = await response.json();

		return data.ip;
	} catch {
		return '';
	}
};
