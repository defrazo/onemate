import type { City } from '.';

const DEFAULT_CITY: City = {
	id: '',
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};
export const createDefaultCity = (): City => ({ ...DEFAULT_CITY });
