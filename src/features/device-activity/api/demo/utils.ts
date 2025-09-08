import { generateUUID, randomNumber } from '@/shared/lib/utils';

import type { ActivityLog } from '../../model';

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
