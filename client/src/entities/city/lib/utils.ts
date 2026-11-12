import type { City } from '../model/types';

export const isSameCity = (a: City, b: City) =>
	a.name === b.name && a.lat === b.lat && a.lon === b.lon && (a.region ?? '') === (b.region ?? '');
