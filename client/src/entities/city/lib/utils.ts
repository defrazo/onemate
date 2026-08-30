import type { City } from '../model';

export const isSameCity = (a: City, b: City): boolean =>
	a.name === b.name && a.lat === b.lat && a.lon === b.lon && (a.region ?? '') === (b.region ?? '');
