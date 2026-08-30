import { API_URLS } from '@/shared/lib/constants';
import { ApiError, EmptyResultError } from '@/shared/lib/errors';
import { generateUUID, randomNumber } from '@/shared/lib/utils';

import type { ActivityLog } from '../model';

export const fakeLog = (opts: { createdAtMs: number; id: string }): ActivityLog => {
	const ip = fakeIP();
	const location = CITIES[Math.floor(Math.random() * CITIES.length)];
	const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
	const isMobile = Math.random() < 0.35;

	return {
		id: generateUUID(),
		user_id: opts.id,
		created_at: new Date(opts.createdAtMs).toISOString(),
		ip_address: ip,
		city: location.city,
		region: location.region,
		browser,
		is_mobile: isMobile,
	};
};

export const fakeIP = (): string => {
	return `${randPubA()}.${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(1, 254)}`;
};

export const fakeLocation = (): { city: string; region: string } => {
	return CITIES[Math.floor(Math.random() * CITIES.length)];
};

const randPubA = (): number => {
	const [min, max] = PUBLIC_BLOCKS[Math.floor(Math.random() * PUBLIC_BLOCKS.length)];
	return randomNumber(min, max);
};

/* prettier-ignore */
const PUBLIC_BLOCKS = [[11,126],[128,169],[171,171],[173,191],[193,223]];
const BROWSERS = ['Firefox', 'Chrome', 'Safari', 'Edge', 'Opera'];
const CITIES = [
	{ city: 'Москва', region: 'Москва' },
	{ city: 'Ростов-на-Дону', region: 'Ростовская область' },
	{ city: 'Казань', region: 'Республика Татарстан' },
	{ city: 'Екатеринбург', region: 'Свердловская область' },
	{ city: 'Новосибирск', region: 'Новосибирская область' },
	{ city: 'Амстердам', region: 'North Holland' },
	{ city: 'Вашингтон', region: 'District of Columbia' },
	{ city: 'Барселона', region: 'Catalonia' },
];

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
